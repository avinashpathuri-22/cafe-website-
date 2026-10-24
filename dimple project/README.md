# Cafe Guide

Cafe Guide is the supplied luxury ocean-inspired cafe site, served by a Java 17 / Spring Boot REST application. The original page's layout, images, colors, typography, animations, menu cards, cart drawer, gallery/lightbox, reservation, reviews, offers, login modal, contact/newsletter forms, and dark theme have been carried into Spring Boot's static resources. Its CSS and JavaScript now live in separate files. A Games & Rewards area adds Casual and Expert Tic-Tac-Toe, replayable Colour Bubbles and Memory Match, account rewards, and a Wednesday promotion banner. Successful sign-in opens a customer profile with account details and reservations made using that account email; posted reviews appear newest-first.

## Run it

Prerequisite: Java 17+. The Maven Wrapper is included, so you do not need a separate Maven install.

On Windows, double-click `start-cafe-guide.bat`. It checks the JDK, downloads Maven the first time, and starts the server. Keep its window open and visit `http://localhost:8080`. Do not open `index.html` directly when using games, feedback, or forms; a `file://` page cannot call the Java API.

```bash
./mvnw spring-boot:run
./mvnw test
./mvnw clean package
```

## Project layout

- `src/main/java/com/cafeguide/CafeGuideApplication.java` — application entry point
- `config/SecurityConfig.java` — Spring Security, session fixation protection, and CSRF cookie setup
- `controller/CafeController.java` — JSON API and validation
- `service/CafeService.java` — sample menu and in-memory business state
- `src/main/resources/static/` — preserved site plus separated CSS and browser scripts
- `src/test/java/` — Spring Boot API smoke tests

## Features and API

All API responses are JSON. Errors use `{ "error": "..." }` where handled. State-changing browser requests use the CSRF token returned by `GET /api/csrf` (also set as a readable `XSRF-TOKEN` cookie).

| Endpoint | Purpose |
| --- | --- |
| `GET /api/menu?search=&category=`; `GET /api/menu/{id}` | Read the original 32 menu items; search and category filter |
| `GET /api/cart`; `POST /api/cart/items` | Read cart; add `{itemId, quantity}` (1–20) |
| `PATCH /api/cart/items/{id}` | Set `{quantity}` (0 removes; maximum 20); server computes prices and 5% demo tax |
| `DELETE /api/cart/items/{id}`; `DELETE /api/cart` | Remove one item or clear the cart |
| `POST /api/reservations`; `GET /api/reservations/{reference}`; `GET /api/reservations/mine` | Create a reservation; retrieve by reference after matching-email sign-in; list the signed-in customer’s own reservations for the profile view |
| `POST /api/auth/register`; `POST /api/auth/login`; `POST /api/auth/logout`; `GET /api/auth/me` | Register, sign in, sign out, inspect current account |
| `GET /api/reviews`; `POST /api/reviews` | List sample/submitted reviews and add a validated review |
| `POST /api/newsletter`; `POST /api/contact` | Store an email subscription or contact message in memory |
| `GET /api/offers`, `/api/offers/wednesday`, `/api/offers/next-wednesday` | Return the Wednesday offer preview/status and Asia/Kolkata date |
| `POST /api/game-sessions`; `POST /api/game-sessions/{id}/complete` | Start and complete a game session |
| `POST /api/game-sessions/{id}/claim`; `GET /api/rewards` | Issue an eligible demo reward and list the signed-in customer's rewards |
| `POST /api/rewards/{id}/redeem` | Redeem an available customer-owned coupon once |

Game session creation accepts `{"game":"TICTACTOE"}`, `BUBBLES`, or `MEMORY`. Completion accepts `{"score":30,"durationSeconds":30}`. Bubbles qualify at 30 points after a 25-second server-timed round; a Tic-Tac-Toe win or a completed Memory round is also eligible. The limit is one reward per game per account per Kolkata calendar day. Coupons are generated server-side and expire after 14 days.

Wednesday offers run for the full Wednesday in `Asia/Kolkata`; the preview identifies the next Wednesday outside the offer day. The example offer is configurable in `application.properties` (15% off an eligible order above ₹500 by default). Cart checkout is intentionally only a calculation demo; it does not process payment. Reservations, newsletter registrations, and contact forms are stored without sending email.

## Data and security limits

There is no database. Accounts, carts, reservations, game sessions, reviews, rewards, subscriptions, and contact messages exist only in process memory and disappear when the server stops. Passwords are BCrypt-hashed; customer identity is held in an HTTP server session with an HttpOnly, SameSite=Lax cookie, session ID rotation at login, and CSRF protection for mutations. This starter uses local HTTP, so cookies are not marked Secure; production HTTPS deployment should enable secure cookies and add rate limiting and operational protections.

The games are rendered in the browser. The server issues opaque session IDs, checks completion status, bounds scores, checks reported duration against server elapsed time, associates coupons with the signed-in customer, and enforces daily limits atomically. A client-driven game is not cheat-proof: Tic-Tac-Toe board moves and bubble/memory events are not replayed by an authoritative server simulation. The endpoints are for a college demonstration, not a real loyalty or point-of-sale system. Wednesday offer data is informational; coupon eligibility is not yet applied to a real order.

## Tests

`mvn test` runs seven Spring Boot checks covering static-page startup, menu search/category, server-side cart totals, review submission/read-back and newest-first display, signed-in reservation history, game session validation, and Wednesday timezone/preview behavior. `mvn clean package` builds the executable Spring Boot jar.
