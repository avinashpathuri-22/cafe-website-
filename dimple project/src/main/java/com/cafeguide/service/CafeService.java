package com.cafeguide.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import java.security.SecureRandom;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class CafeService {
  public record MenuItem(int id, String name, String cat, String desc, double price, double rating, boolean veg, String img, boolean available) {}
  public record CartLine(MenuItem item, int quantity) {}
  public record Reservation(String reference, String name, String phone, String email, LocalDate date, String time, int guests, String seating, String requests) {}
  public record Review(String name, int rating, String text, String date, boolean sample) {}
  public record Reward(String id, String code, String type, String detail, Instant issuedAt, Instant expiresAt, String status, String game) {}
  public record GameSession(String id, String game, Instant startedAt, Instant completedAt, Integer score, boolean eligible, String status) {}
  private record User(String name, String email, String hash, String id) {}

  private final Map<Integer,MenuItem> menu = new LinkedHashMap<>();
  private final Map<String,User> users = new ConcurrentHashMap<>();
  private final Map<String,ConcurrentMap<Integer,Integer>> carts = new ConcurrentHashMap<>();
  private final Map<String,Reservation> reservations = new ConcurrentHashMap<>();
  private final Map<String,GameSession> games = new ConcurrentHashMap<>();
  private final Map<String,CopyOnWriteArrayList<Reward>> rewards = new ConcurrentHashMap<>();
  private final ConcurrentLinkedDeque<Review> reviews = new ConcurrentLinkedDeque<>();
  private final Set<String> subscribers = ConcurrentHashMap.newKeySet();
  private final List<Map<String,String>> messages = new CopyOnWriteArrayList<>();
  private final ConcurrentMap<String,AtomicInteger> rewardDayCounts = new ConcurrentHashMap<>();
  private final SecureRandom random = new SecureRandom();
  private final PasswordEncoder encoder;
  private final Clock clock;
  private final ZoneId zone;
  private final int bubbleThreshold;
  private final int dailyLimit;
  private final int wednesdayDiscountPercent;
  private final int wednesdayMinimumSpend;

  public CafeService(PasswordEncoder encoder, Clock clock,
      @Value("${cafeguide.games.bubbles-qualifying-score:30}") int bubbleThreshold,
      @Value("${cafeguide.games.daily-reward-limit:1}") int dailyLimit,
      @Value("${cafeguide.offers.wednesday.discount-percent:15}") int wednesdayDiscountPercent,
      @Value("${cafeguide.offers.wednesday.minimum-spend:500}") int wednesdayMinimumSpend) {
    this.encoder = encoder;
    this.clock = clock;
    this.zone = clock.getZone();
    this.bubbleThreshold = bubbleThreshold;
    this.dailyLimit = dailyLimit;
    this.wednesdayDiscountPercent = wednesdayDiscountPercent;
    this.wednesdayMinimumSpend = wednesdayMinimumSpend;
    int id=1;
    menu.put(id, new MenuItem(id++, "Classic Espresso", "Coffee", "Bold double-shot espresso with a rich crema finish.", 150, 4.8, true, "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=500&q=80", true));
    menu.put(id, new MenuItem(id++, "Ocean Blue Latte", "Coffee", "Silky steamed milk latte with our signature blue butterfly pea art.", 210, 4.9, true, "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=500&q=80", true));
    menu.put(id, new MenuItem(id++, "Coastal Chamomile Tea", "Tea", "Soothing chamomile blend served with a touch of honey.", 170, 4.6, true, "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=500&q=80", true));
    menu.put(id, new MenuItem(id++, "Masala Chai", "Tea", "Traditional spiced tea brewed with fresh ginger and cardamom.", 120, 4.7, true, "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=500&q=80", true));
    menu.put(id, new MenuItem(id++, "Iced Caramel Cold Coffee", "Cold Coffee", "Chilled coffee swirled with caramel and topped with whipped cream.", 230, 4.8, true, "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=500&q=80", true));
    menu.put(id, new MenuItem(id++, "Frappe Deluxe", "Cold Coffee", "Thick blended coffee frappe finished with cocoa dust.", 250, 4.7, true, "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80", true));
    menu.put(id, new MenuItem(id++, "Belgian Chocolate Shake", "Milkshakes", "Creamy shake made with premium Belgian chocolate.", 220, 4.9, true, "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=500&q=80", true));
    menu.put(id, new MenuItem(id++, "Strawberry Bliss Shake", "Milkshakes", "Fresh strawberries blended with creamy vanilla ice cream.", 210, 4.6, true, "https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=500&q=80", true));
    menu.put(id, new MenuItem(id++, "Blue Lagoon Mocktail", "Mocktails", "A refreshing blue curacao inspired mocktail with citrus fizz.", 240, 4.8, true, "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=500&q=80", true));
    menu.put(id, new MenuItem(id++, "Tropical Sunset Mocktail", "Mocktails", "Layered mango and grenadine mocktail with a beach-side vibe.", 230, 4.7, true, "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=500&q=80", true));
    menu.put(id, new MenuItem(id++, "Cold Pressed Orange Juice", "Fresh Juice", "100% pure cold-pressed oranges, no added sugar.", 180, 4.8, true, "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=500&q=80", true));
    menu.put(id, new MenuItem(id++, "Watermelon Mint Cooler", "Fresh Juice", "Chilled watermelon juice infused with fresh mint leaves.", 170, 4.7, true, "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=500&q=80", true));
    menu.put(id, new MenuItem(id++, "Margherita Pizza", "Pizza", "Classic pizza with fresh mozzarella, basil, and tomato sauce.", 340, 4.8, true, "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80", true));
    menu.put(id, new MenuItem(id++, "Peri Peri Chicken Pizza", "Pizza", "Spicy peri peri chicken with bell peppers and mozzarella.", 410, 4.7, false, "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80", true));
    menu.put(id, new MenuItem(id++, "Classic Cheese Burger", "Burger", "Juicy grilled patty with cheddar cheese and secret sauce.", 250, 4.7, false, "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80", true));
    menu.put(id, new MenuItem(id++, "Ocean Veggie Burger", "Burger", "Crispy veg patty loaded with fresh lettuce and tangy mayo.", 220, 4.6, true, "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80", true));
    menu.put(id, new MenuItem(id++, "Grilled Chicken Sandwich", "Sandwich", "Toasted sandwich with grilled chicken and herb mayo.", 230, 4.6, false, "https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=500&q=80", true));
    menu.put(id, new MenuItem(id++, "Club Veg Sandwich", "Sandwich", "Triple-layered sandwich with fresh veggies and cheese.", 190, 4.5, true, "https://images.unsplash.com/photo-1481070555726-e2fe8357725c?auto=format&fit=crop&w=500&q=80", true));
    menu.put(id, new MenuItem(id++, "Creamy Alfredo Pasta", "Pasta", "Rich white sauce pasta tossed with herbs and parmesan.", 320, 4.8, true, "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=500&q=80", true));
    menu.put(id, new MenuItem(id++, "Spicy Arrabbiata Pasta", "Pasta", "Penne pasta tossed in a spicy tomato and garlic sauce.", 300, 4.6, true, "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=500&q=80", true));
    menu.put(id, new MenuItem(id++, "Classic Salted Fries", "French Fries", "Golden crispy fries with a sprinkle of sea salt.", 140, 4.5, true, "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=500&q=80", true));
    menu.put(id, new MenuItem(id++, "Peri Peri Fries", "French Fries", "Crispy fries tossed in tangy peri peri seasoning.", 160, 4.7, true, "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=500&q=80", true));
    menu.put(id, new MenuItem(id++, "Cheesy Garlic Bread", "Garlic Bread", "Toasted bread loaded with garlic butter and melted cheese.", 180, 4.8, true, "https://images.unsplash.com/photo-1573140401552-3fab0b24427f?auto=format&fit=crop&w=500&q=80", true));
    menu.put(id, new MenuItem(id++, "Herb Garlic Bread", "Garlic Bread", "Classic garlic bread infused with mixed Italian herbs.", 150, 4.5, true, "https://images.unsplash.com/photo-1573225342350-16731dd9bf3d?auto=format&fit=crop&w=500&q=80", true));
    menu.put(id, new MenuItem(id++, "Molten Chocolate Lava", "Desserts", "Warm chocolate cake with a gooey molten center.", 260, 4.9, true, "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80", true));
    menu.put(id, new MenuItem(id++, "Tiramisu Cup", "Desserts", "Classic Italian layered dessert with mascarpone and coffee.", 240, 4.8, true, "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=500&q=80", true));
    menu.put(id, new MenuItem(id++, "Vanilla Bean Ice Cream", "Ice Cream", "Creamy vanilla bean ice cream served in a waffle bowl.", 150, 4.6, true, "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=500&q=80", true));
    menu.put(id, new MenuItem(id++, "Sea Salt Caramel Gelato", "Ice Cream", "Artisan gelato with a sea salt caramel swirl.", 190, 4.8, true, "https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?auto=format&fit=crop&w=500&q=80", true));
    menu.put(id, new MenuItem(id++, "Red Velvet Cake Slice", "Cakes", "Moist red velvet layered with cream cheese frosting.", 200, 4.8, true, "https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&w=500&q=80", true));
    menu.put(id, new MenuItem(id++, "Blueberry Cheesecake", "Cakes", "Silky cheesecake topped with a fresh blueberry compote.", 220, 4.9, true, "https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=500&q=80", true));
    menu.put(id, new MenuItem(id++, "Butter Croissant", "Pastries", "Flaky, buttery croissant baked fresh every morning.", 130, 4.7, true, "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80", true));
    menu.put(id, new MenuItem(id++, "Almond Danish Pastry", "Pastries", "Sweet danish pastry topped with toasted almond flakes.", 150, 4.6, true, "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&w=500&q=80", true));
    reviews.addLast(new Review("Sarah Mitchell",5,"Absolutely stunning ambience! The Ocean Blue Latte is a work of art.","Sample",true));
    reviews.addLast(new Review("Priya Sharma",4,"Loved the desserts and the friendly service.","Sample",true));
  }
  public Collection<MenuItem> menu(String q,String category){return menu.values().stream().filter(i->q==null||i.name().toLowerCase().contains(q.toLowerCase())).filter(i->category==null||category.equalsIgnoreCase("All")||i.cat().equalsIgnoreCase(category)).toList();}
  public MenuItem item(int id){return menu.get(id);}
  public Map<String,Object> cart(String key){var rows=new ArrayList<Map<String,Object>>(); double subtotal=0; int count=0; var items=carts.getOrDefault(key,new ConcurrentHashMap<>()); for(var e:items.entrySet()){MenuItem i=menu.get(e.getKey()); if(i!=null){double line=i.price()*e.getValue(); subtotal+=line;count+=e.getValue();rows.add(Map.of("item",i,"quantity",e.getValue(),"lineTotal",line));}} return Map.of("items",rows,"count",count,"subtotal",subtotal,"tax",subtotal*.05,"total",subtotal*1.05);}
  public Map<String,Object> addCart(String key,int id,int qty){MenuItem i=menu.get(id);if(i==null||!i.available())throw new IllegalArgumentException("Menu item is unavailable.");if(qty<1||qty>20)throw new IllegalArgumentException("Quantity must be between 1 and 20.");var c=carts.computeIfAbsent(key,k->new ConcurrentHashMap<>());c.compute(id,(k,v)->{int n=(v==null?0:v)+qty;if(n>20)throw new IllegalArgumentException("Maximum quantity per item is 20.");return n;});return cart(key);}
  public Map<String,Object> clearCart(String key){carts.remove(key);return cart(key);}
  public Map<String,Object> quantity(String key,int id,int qty){if(qty<0||qty>20)throw new IllegalArgumentException("Quantity must be between 0 and 20.");var c=carts.computeIfAbsent(key,k->new ConcurrentHashMap<>());if(qty==0)c.remove(id);else if(menu.containsKey(id))c.put(id,qty);else throw new IllegalArgumentException("Menu item not found.");return cart(key);}
  public Reservation reserve(Map<String,Object> d){LocalDate date;LocalTime time;try{date=LocalDate.parse(s(d,"date"));time=LocalTime.parse(s(d,"time"));}catch(RuntimeException e){throw new IllegalArgumentException("Choose a valid reservation date and time.");}if(date.isBefore(LocalDate.now(clock)))throw new IllegalArgumentException("Reservation date cannot be in the past.");if(date.equals(LocalDate.now(clock))&&time.isBefore(LocalTime.now(clock)))throw new IllegalArgumentException("Reservation time cannot be in the past.");int guests=((Number)d.get("guests")).intValue();if(guests<1||guests>20)throw new IllegalArgumentException("Guests must be between 1 and 20.");String seating=s(d,"seating");if(!Set.of("Indoor","Outdoor").contains(seating))throw new IllegalArgumentException("Choose indoor or outdoor seating.");String ref="CG-"+UUID.randomUUID().toString().substring(0,8).toUpperCase(Locale.ROOT);Reservation r=new Reservation(ref,s(d,"name"),s(d,"phone"),s(d,"email"),date,time.toString(),guests,seating,s(d,"requests"));reservations.put(ref,r);return r;}
  public Reservation reservation(String ref){return reservations.get(ref);}
  public List<Reservation> reservationsFor(String email){return reservations.values().stream().filter(r->r.email().equalsIgnoreCase(email)).sorted(Comparator.comparing(Reservation::date).thenComparing(Reservation::time).reversed()).toList();}
  public Map<String,String> register(String name,String email,String password){String key=email.toLowerCase(Locale.ROOT);if(users.containsKey(key))throw new IllegalArgumentException("An account with this email already exists.");User u=new User(name,key,encoder.encode(password),UUID.randomUUID().toString());if(users.putIfAbsent(key,u)!=null)throw new IllegalArgumentException("An account with this email already exists.");return Map.of("id",u.id(),"name",u.name(),"email",u.email());}
  public Map<String,String> login(String email,String password){User u=users.get(email.toLowerCase(Locale.ROOT));if(u==null||!encoder.matches(password,u.hash()))throw new IllegalArgumentException("Email or password is incorrect.");return Map.of("id",u.id(),"name",u.name(),"email",u.email());}
  public boolean exists(String email){return users.containsKey(email.toLowerCase(Locale.ROOT));}
  public Map<String,String> user(String email){User u=users.get(email);return u==null?null:Map.of("id",u.id(),"name",u.name(),"email",u.email());}
  public boolean addSubscriber(String email){return subscribers.add(email.toLowerCase(Locale.ROOT));}
  public void addMessage(Map<String,String> m){messages.add(Map.copyOf(m));}
  public List<Review> reviews(){return List.copyOf(reviews);}
  public Review addReview(String name,int rating,String text){Review r=new Review(name,rating,text,LocalDate.now(clock).toString(),false);reviews.addFirst(r);return r;}
  public Map<String,Object> offers(){ZonedDateTime now=ZonedDateTime.now(clock);ZonedDateTime next=now.with(TemporalAdjusters.next(DayOfWeek.WEDNESDAY)).toLocalDate().atStartOfDay(zone);boolean active=now.getDayOfWeek()==DayOfWeek.WEDNESDAY;return Map.of("timezone",zone.getId(),"active",active,"nextWednesday",(active?now.toLocalDate():next.toLocalDate()).toString(),"title",active?"Wednesday Special — Today":"Next Wednesday Specials","discountPercent",wednesdayDiscountPercent,"minimumSpend",wednesdayMinimumSpend,"terms",wednesdayDiscountPercent+"% off eligible cafe orders above ₹"+wednesdayMinimumSpend+". One coupon per signed-in customer; demo offer.");}
  public GameSession startGame(String game){if(!Set.of("TICTACTOE","BUBBLES","MEMORY").contains(game))throw new IllegalArgumentException("Unknown game type.");String id=UUID.randomUUID().toString();GameSession g=new GameSession(id,game,Instant.now(clock),null,null,false,"ACTIVE");games.put(id,g);return g;}
  public GameSession completeGame(String id,int score,long durationSeconds){GameSession g=games.get(id);if(g==null)throw new NoSuchElementException("Game session not found.");if(!g.status().equals("ACTIVE"))throw new IllegalArgumentException("Game session is already completed.");if(score<0||score>100000||durationSeconds<0||durationSeconds>7200)throw new IllegalArgumentException("Invalid game result.");if(Duration.between(g.startedAt(),Instant.now(clock)).toSeconds()+2<durationSeconds)throw new IllegalArgumentException("Reported duration exceeds server session time.");boolean eligible=(g.game().equals("BUBBLES")&&score>=bubbleThreshold&&durationSeconds>=25)||(g.game().equals("TICTACTOE")&&score==1&&Duration.between(g.startedAt(),Instant.now(clock)).toSeconds()>=8)||(g.game().equals("MEMORY")&&score==1&&durationSeconds>=5);GameSession done=new GameSession(id,g.game(),g.startedAt(),Instant.now(clock),score,eligible,"COMPLETED");games.put(id,done);return done;}
  public synchronized Reward claim(String id,String email){GameSession g=games.get(id);if(g==null)throw new NoSuchElementException("Game session not found.");if(!exists(email))throw new SecurityException("Sign in to claim a reward.");User u=users.get(email);if(!g.eligible()||!g.status().equals("COMPLETED"))throw new IllegalArgumentException("This game session has no eligible reward.");String day=LocalDate.now(clock).toString();String key=u.id()+":"+g.game()+":"+day;AtomicInteger count=rewardDayCounts.computeIfAbsent(key,k->new AtomicInteger());if(count.incrementAndGet()>dailyLimit){count.decrementAndGet();throw new IllegalArgumentException("Daily game reward limit reached.");}String code="CAFE-"+Long.toString(random.nextLong(1_000_000_000L),36).toUpperCase(Locale.ROOT);Reward reward=new Reward(UUID.randomUUID().toString(),code,"DISCOUNT","₹50 off orders above ₹300",Instant.now(clock),Instant.now(clock).plus(14,ChronoUnit.DAYS),"AVAILABLE",g.game());rewards.computeIfAbsent(u.id(),k->new CopyOnWriteArrayList<>()).add(reward);return reward;}
  public List<Reward> rewards(String email){if(!exists(email))throw new SecurityException("Sign in to view rewards.");String id=users.get(email).id();return rewards.getOrDefault(id,new CopyOnWriteArrayList<>()).stream().map(r->r.status().equals("AVAILABLE")&&r.expiresAt().isBefore(Instant.now(clock))?new Reward(r.id(),r.code(),r.type(),r.detail(),r.issuedAt(),r.expiresAt(),"EXPIRED",r.game()):r).toList();}
  public synchronized Reward redeem(String email,String id){if(!exists(email))throw new SecurityException("Sign in to redeem a reward.");var list=rewards.get(users.get(email).id());if(list==null)throw new NoSuchElementException("Reward not found.");for(int i=0;i<list.size();i++){Reward r=list.get(i);if(r.id().equals(id)){if(!r.status().equals("AVAILABLE"))throw new IllegalArgumentException("Reward is not available.");if(r.expiresAt().isBefore(Instant.now(clock)))throw new IllegalArgumentException("Reward has expired.");Reward used=new Reward(r.id(),r.code(),r.type(),r.detail(),r.issuedAt(),r.expiresAt(),"REDEEMED",r.game());list.set(i,used);return used;}}throw new NoSuchElementException("Reward not found.");}
  private String s(Map<String,Object> d,String k){return Objects.toString(d.getOrDefault(k,""),"").trim();}
}
