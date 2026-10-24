package com.cafeguide.controller;

import com.cafeguide.service.CafeService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
public class CafeController {
  private final CafeService service;
  public CafeController(CafeService service){this.service=service;}
  record Auth(@NotBlank @Size(max=80) String name,@Email @NotBlank String email,@Size(min=7,max=100) String password){}
  record Login(@Email @NotBlank String email,@NotBlank String password){}
  record AddItem(@Min(1) int itemId,@Min(1) @Max(20) int quantity){}
  record Qty(@Min(0) @Max(20) int quantity){}
  record ReviewRequest(@NotBlank @Size(max=80) String name,@Min(1) @Max(5) int rating,@NotBlank @Size(min=10,max=1000) String text){}
  record ReservationRequest(@NotBlank @Size(max=80) String name,@NotBlank @Size(max=24) String phone,@Email @NotBlank String email,@NotBlank String date,@NotBlank String time,@Min(1) @Max(20) int guests,@NotBlank String seating,@Size(max=500) String requests){}
  record GameResult(@Min(0) int score,@Min(0) @Max(7200) long durationSeconds){}
  private String email(HttpSession s){return (String)s.getAttribute("customerEmail");}
  private String cartKey(HttpSession s){String e=email(s);return e==null?"guest:"+s.getId():"customer:"+e;}
  private ResponseEntity<Map<String,String>> error(HttpStatus status,String message){return ResponseEntity.status(status).body(Map.of("error",message));}

  @GetMapping("/csrf") Map<String,String> csrf(CsrfToken token){return Map.of("headerName",token.getHeaderName(),"token",token.getToken());}
  @GetMapping("/menu") Object menu(@RequestParam(required=false) String search,@RequestParam(required=false) String category,@RequestParam(required=false) String q){return service.menu(search==null?q:search,category);}
  @GetMapping("/menu/{id}") ResponseEntity<?> item(@PathVariable int id){var i=service.item(id);return i==null?error(HttpStatus.NOT_FOUND,"Menu item not found."):ResponseEntity.ok(i);}
  @GetMapping("/cart") Object cart(HttpSession s){return service.cart(cartKey(s));}
  @PostMapping("/cart/items") Object add(@Valid @RequestBody AddItem d,HttpSession s){return service.addCart(cartKey(s),d.itemId(),d.quantity());}
  @PatchMapping("/cart/items/{id}") Object quantity(@PathVariable int id,@Valid @RequestBody Qty d,HttpSession s){return service.quantity(cartKey(s),id,d.quantity());}
  @DeleteMapping("/cart/items/{id}") Object remove(@PathVariable int id,HttpSession s){return service.quantity(cartKey(s),id,0);}
  @DeleteMapping("/cart") Object clear(HttpSession s){return service.clearCart(cartKey(s));}
  @PostMapping("/reservations") ResponseEntity<?> reserve(@Valid @RequestBody ReservationRequest d){try{return ResponseEntity.status(HttpStatus.CREATED).body(service.reserve(Map.of("name",d.name(),"phone",d.phone(),"email",d.email(),"date",d.date(),"time",d.time(),"guests",d.guests(),"seating",d.seating(),"requests",Objects.toString(d.requests(),""))));}catch(Exception e){return error(HttpStatus.BAD_REQUEST,e.getMessage());}}
  @GetMapping("/reservations/mine") ResponseEntity<?> myReservations(HttpSession s){String e=email(s);return e==null?error(HttpStatus.UNAUTHORIZED,"Sign in to view your reservations."):ResponseEntity.ok(service.reservationsFor(e));}
  @GetMapping("/reservations/{reference}") ResponseEntity<?> reservation(@PathVariable String reference,HttpSession s){var r=service.reservation(reference);if(r==null)return error(HttpStatus.NOT_FOUND,"Reservation not found.");if(email(s)==null||!email(s).equalsIgnoreCase(r.email()))return error(HttpStatus.FORBIDDEN,"Sign in with the email used for this reservation.");return ResponseEntity.ok(r);}
  @PostMapping("/auth/register") ResponseEntity<?> register(@Valid @RequestBody Auth d,HttpServletRequest request,HttpSession session){try{var u=service.register(d.name(),d.email(),d.password());request.changeSessionId();session.setAttribute("customerEmail",d.email().toLowerCase(Locale.ROOT));return ResponseEntity.status(HttpStatus.CREATED).body(u);}catch(IllegalArgumentException e){return error(HttpStatus.CONFLICT,e.getMessage());}}
  @PostMapping("/auth/login") ResponseEntity<?> login(@Valid @RequestBody Login d,HttpServletRequest request,HttpSession session){try{var u=service.login(d.email(),d.password());request.changeSessionId();session.setAttribute("customerEmail",d.email().toLowerCase(Locale.ROOT));return ResponseEntity.ok(u);}catch(IllegalArgumentException e){return error(HttpStatus.UNAUTHORIZED,e.getMessage());}}
  @PostMapping("/auth/logout") Object logout(HttpSession session){session.invalidate();return Map.of("message","Signed out.");}
  @GetMapping("/auth/me") ResponseEntity<?> me(HttpSession s){String e=email(s);return e==null?error(HttpStatus.UNAUTHORIZED,"Sign in required."):ResponseEntity.ok(service.user(e));}
  @GetMapping("/reviews") Object reviews(){var rs=service.reviews();double avg=rs.stream().mapToInt(CafeService.Review::rating).average().orElse(0);return Map.of("items",rs,"count",rs.size(),"average",avg);}
  @PostMapping("/reviews") ResponseEntity<?> addReview(@Valid @RequestBody ReviewRequest d){return ResponseEntity.status(HttpStatus.CREATED).body(service.addReview(d.name(),d.rating(),d.text()));}
  @PostMapping("/newsletter") ResponseEntity<?> newsletter(@RequestBody Map<String,String> d){String e=Objects.toString(d.get("email"),"").trim();if(!e.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"))return error(HttpStatus.BAD_REQUEST,"Enter a valid email address.");return service.addSubscriber(e)?ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message","Subscription saved.")):error(HttpStatus.CONFLICT,"This email is already subscribed.");}
  @PostMapping("/contact") ResponseEntity<?> contact(@RequestBody Map<String,String> d){for(String k:List.of("name","email","subject","message")){String v=d.get(k);if(v==null||v.isBlank()||v.length()>2000)return error(HttpStatus.BAD_REQUEST,"Please complete all contact fields.");}service.addMessage(d);return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message","Your message was recorded. No email was sent."));}
  @GetMapping("/offers") Object offers(){return service.offers();}
  @GetMapping("/offers/wednesday") Object wednesday(){return service.offers();}
  @GetMapping("/offers/next-wednesday") Object nextWednesday(){return service.offers();}
  @PostMapping("/game-sessions") Object start(@RequestBody Map<String,String> d){return service.startGame(Objects.toString(d.get("game"),""));}
  @PostMapping("/game-sessions/{id}/complete") Object complete(@PathVariable String id,@Valid @RequestBody GameResult d){return service.completeGame(id,d.score(),d.durationSeconds());}
  @PostMapping("/game-sessions/{id}/claim") ResponseEntity<?> claim(@PathVariable String id,HttpSession s){String e=email(s);if(e==null)return error(HttpStatus.UNAUTHORIZED,"Sign in to claim a reward.");try{return ResponseEntity.status(HttpStatus.CREATED).body(service.claim(id,e));}catch(SecurityException ex){return error(HttpStatus.UNAUTHORIZED,ex.getMessage());}catch(IllegalArgumentException ex){return error(HttpStatus.CONFLICT,ex.getMessage());}catch(NoSuchElementException ex){return error(HttpStatus.NOT_FOUND,ex.getMessage());}}
  @GetMapping("/rewards") ResponseEntity<?> rewards(HttpSession s){String e=email(s);if(e==null)return error(HttpStatus.UNAUTHORIZED,"Sign in to view rewards.");return ResponseEntity.ok(service.rewards(e));}
  @PostMapping("/rewards/{id}/redeem") ResponseEntity<?> redeem(@PathVariable String id,HttpSession s){String e=email(s);if(e==null)return error(HttpStatus.UNAUTHORIZED,"Sign in to redeem a reward.");try{return ResponseEntity.ok(service.redeem(e,id));}catch(NoSuchElementException ex){return error(HttpStatus.NOT_FOUND,ex.getMessage());}catch(IllegalArgumentException ex){return error(HttpStatus.CONFLICT,ex.getMessage());}}
  @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class) ResponseEntity<?> validation(org.springframework.web.bind.MethodArgumentNotValidException e){String field=e.getBindingResult().getFieldErrors().stream().findFirst().map(org.springframework.validation.FieldError::getField).orElse("");String message=switch(field){case "password" -> "Password must contain at least 7 characters.";case "email" -> "Enter a valid email address.";case "name" -> "Enter a name of up to 80 characters.";default -> "Please check the submitted fields.";};return error(HttpStatus.BAD_REQUEST,message);}
  @ExceptionHandler(IllegalArgumentException.class) ResponseEntity<?> badRequest(IllegalArgumentException e){return error(HttpStatus.BAD_REQUEST,e.getMessage());}
  @ExceptionHandler(NoSuchElementException.class) ResponseEntity<?> missing(NoSuchElementException e){return error(HttpStatus.NOT_FOUND,e.getMessage());}
}
