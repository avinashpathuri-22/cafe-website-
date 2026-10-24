
/* =====================================================================
   CAFE GUIDE — MAIN JAVASCRIPT
   ===================================================================== */

/* ---------- LOADING SCREEN ---------- */
window.addEventListener('load', () => {
  const loader = document.getElementById('loading-screen');
  setTimeout(() => loader.classList.add('hidden'), 600);
});

/* ---------- TOAST NOTIFICATIONS ---------- */
function showToast(message, type = 'info', icon = 'fa-circle-info'){
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast ' + (type === 'success' ? 'success' : '');
  toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}

/* ---------- NAVBAR SCROLL + ACTIVE LINK ---------- */
const navbar = document.getElementById('navbar');
const navLinksEls = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id], header[id]');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  backToTopBtn.classList.toggle('show', window.scrollY > 500);

  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 120;
    if (window.scrollY >= top) current = sec.getAttribute('id');
  });
  navLinksEls.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
});

/* ---------- MOBILE MENU ---------- */
const hamburger = document.getElementById('hamburger');
const navLinksWrap = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinksWrap.classList.toggle('open');
});
navLinksEls.forEach(link => link.addEventListener('click', () => {
  hamburger.classList.remove('active');
  navLinksWrap.classList.remove('open');
}));

/* ---------- SMOOTH SCROLL ---------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e){
    const targetId = this.getAttribute('href');
    if(targetId.length > 1){
      const target = document.querySelector(targetId);
      if(target){
        e.preventDefault();
        window.scrollTo({top: target.offsetTop - 84, behavior: 'smooth'});
      }
    }
  });
});

/* ---------- DARK MODE TOGGLE ---------- */
const darkToggle = document.getElementById('darkToggle');
const root = document.documentElement;
function applyTheme(theme){
  root.setAttribute('data-theme', theme);
  darkToggle.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  try{ localStorage.setItem('cg-theme', theme); }catch(e){}
}
let savedTheme = 'light';
try{ savedTheme = localStorage.getItem('cg-theme') || 'light'; }catch(e){}
applyTheme(savedTheme);
darkToggle.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(next);
});

/* ---------- FLOATING BUBBLES ---------- */
function createBubbles(container, count){
  for(let i=0;i<count;i++){
    const b = document.createElement('div');
    b.className = 'bubble';
    const size = Math.random()*40+10;
    b.style.width = size+'px';
    b.style.height = size+'px';
    b.style.left = Math.random()*100+'%';
    b.style.animationDuration = (Math.random()*10+8)+'s';
    b.style.animationDelay = (Math.random()*10)+'s';
    container.appendChild(b);
  }
}
createBubbles(document.getElementById('heroBubbles'), 22);

/* ---------- BACK TO TOP ---------- */
const backToTopBtn = document.getElementById('back-to-top');
backToTopBtn.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

/* ---------- SCROLL REVEAL ANIMATIONS ---------- */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {threshold: 0.15});
revealEls.forEach(el => revealObserver.observe(el));

/* ---------- ANIMATED STATS COUNTER ---------- */
const counters = document.querySelectorAll('.counter');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      const el = entry.target;
      const target = parseFloat(el.getAttribute('data-target'));
      const decimals = parseInt(el.getAttribute('data-decimal') || '0');
      let current = 0;
      const step = target / 80;
      const update = () => {
        current += step;
        if(current < target){
          el.textContent = decimals ? current.toFixed(decimals) : Math.floor(current).toLocaleString();
          requestAnimationFrame(update);
        } else {
          el.textContent = decimals ? target.toFixed(decimals) : target.toLocaleString();
        }
      };
      update();
      counterObserver.unobserve(el);
    }
  });
}, {threshold: 0.4});
counters.forEach(c => counterObserver.observe(c));

/* =====================================================================
   MENU DATA
   ===================================================================== */
const menuData = [
  {id:1, name:'Classic Espresso', cat:'Coffee', desc:'Bold double-shot espresso with a rich crema finish.', price:150, rating:4.8, veg:true, img:'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=500&q=80'},
  {id:2, name:'Ocean Blue Latte', cat:'Coffee', desc:'Silky steamed milk latte with our signature blue butterfly pea art.', price:210, rating:4.9, veg:true, img:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=500&q=80', badge:"Chef's Pick"},
  {id:3, name:'Coastal Chamomile Tea', cat:'Tea', desc:'Soothing chamomile blend served with a touch of honey.', price:170, rating:4.6, veg:true, img:'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=500&q=80'},
  {id:4, name:'Masala Chai', cat:'Tea', desc:'Traditional spiced tea brewed with fresh ginger and cardamom.', price:120, rating:4.7, veg:true, img:'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=500&q=80'},
  {id:5, name:'Iced Caramel Cold Coffee', cat:'Cold Coffee', desc:'Chilled coffee swirled with caramel and topped with whipped cream.', price:230, rating:4.8, veg:true, img:'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=500&q=80'},
  {id:6, name:'Frappe Deluxe', cat:'Cold Coffee', desc:'Thick blended coffee frappe finished with cocoa dust.', price:250, rating:4.7, veg:true, img:'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80'},
  {id:7, name:'Belgian Chocolate Shake', cat:'Milkshakes', desc:'Creamy shake made with premium Belgian chocolate.', price:220, rating:4.9, veg:true, img:'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=500&q=80'},
  {id:8, name:'Strawberry Bliss Shake', cat:'Milkshakes', desc:'Fresh strawberries blended with creamy vanilla ice cream.', price:210, rating:4.6, veg:true, img:'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=500&q=80'},
  {id:9, name:'Blue Lagoon Mocktail', cat:'Mocktails', desc:'A refreshing blue curacao inspired mocktail with citrus fizz.', price:240, rating:4.8, veg:true, img:'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=500&q=80', badge:'Signature'},
  {id:10, name:'Tropical Sunset Mocktail', cat:'Mocktails', desc:'Layered mango and grenadine mocktail with a beach-side vibe.', price:230, rating:4.7, veg:true, img:'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=500&q=80'},
  {id:11, name:'Cold Pressed Orange Juice', cat:'Fresh Juice', desc:'100% pure cold-pressed oranges, no added sugar.', price:180, rating:4.8, veg:true, img:'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=500&q=80'},
  {id:12, name:'Watermelon Mint Cooler', cat:'Fresh Juice', desc:'Chilled watermelon juice infused with fresh mint leaves.', price:170, rating:4.7, veg:true, img:'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=500&q=80'},
  {id:13, name:'Margherita Pizza', cat:'Pizza', desc:'Classic pizza with fresh mozzarella, basil, and tomato sauce.', price:340, rating:4.8, veg:true, img:'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80'},
  {id:14, name:'Peri Peri Chicken Pizza', cat:'Pizza', desc:'Spicy peri peri chicken with bell peppers and mozzarella.', price:410, rating:4.7, veg:false, img:'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80'},
  {id:15, name:'Classic Cheese Burger', cat:'Burger', desc:'Juicy grilled patty with cheddar cheese and secret sauce.', price:250, rating:4.7, veg:false, img:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80'},
  {id:16, name:'Ocean Veggie Burger', cat:'Burger', desc:'Crispy veg patty loaded with fresh lettuce and tangy mayo.', price:220, rating:4.6, veg:true, img:'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80'},
  {id:17, name:'Grilled Chicken Sandwich', cat:'Sandwich', desc:'Toasted sandwich with grilled chicken and herb mayo.', price:230, rating:4.6, veg:false, img:'https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=500&q=80'},
  {id:18, name:'Club Veg Sandwich', cat:'Sandwich', desc:'Triple-layered sandwich with fresh veggies and cheese.', price:190, rating:4.5, veg:true, img:'https://images.unsplash.com/photo-1481070555726-e2fe8357725c?auto=format&fit=crop&w=500&q=80'},
  {id:19, name:'Creamy Alfredo Pasta', cat:'Pasta', desc:'Rich white sauce pasta tossed with herbs and parmesan.', price:320, rating:4.8, veg:true, img:'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=500&q=80'},
  {id:20, name:'Spicy Arrabbiata Pasta', cat:'Pasta', desc:'Penne pasta tossed in a spicy tomato and garlic sauce.', price:300, rating:4.6, veg:true, img:'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=500&q=80'},
  {id:21, name:'Classic Salted Fries', cat:'French Fries', desc:'Golden crispy fries with a sprinkle of sea salt.', price:140, rating:4.5, veg:true, img:'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=500&q=80'},
  {id:22, name:'Peri Peri Fries', cat:'French Fries', desc:'Crispy fries tossed in tangy peri peri seasoning.', price:160, rating:4.7, veg:true, img:'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=500&q=80'},
  {id:23, name:'Cheesy Garlic Bread', cat:'Garlic Bread', desc:'Toasted bread loaded with garlic butter and melted cheese.', price:180, rating:4.8, veg:true, img:'https://images.unsplash.com/photo-1573140401552-3fab0b24427f?auto=format&fit=crop&w=500&q=80'},
  {id:24, name:'Herb Garlic Bread', cat:'Garlic Bread', desc:'Classic garlic bread infused with mixed Italian herbs.', price:150, rating:4.5, veg:true, img:'https://images.unsplash.com/photo-1573225342350-16731dd9bf3d?auto=format&fit=crop&w=500&q=80'},
  {id:25, name:'Molten Chocolate Lava', cat:'Desserts', desc:'Warm chocolate cake with a gooey molten center.', price:260, rating:4.9, veg:true, img:'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80', badge:'Best Seller'},
  {id:26, name:'Tiramisu Cup', cat:'Desserts', desc:'Classic Italian layered dessert with mascarpone and coffee.', price:240, rating:4.8, veg:true, img:'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=500&q=80'},
  {id:27, name:'Vanilla Bean Ice Cream', cat:'Ice Cream', desc:'Creamy vanilla bean ice cream served in a waffle bowl.', price:150, rating:4.6, veg:true, img:'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=500&q=80'},
  {id:28, name:'Sea Salt Caramel Gelato', cat:'Ice Cream', desc:'Artisan gelato with a sea salt caramel swirl.', price:190, rating:4.8, veg:true, img:'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?auto=format&fit=crop&w=500&q=80'},
  {id:29, name:'Red Velvet Cake Slice', cat:'Cakes', desc:'Moist red velvet layered with cream cheese frosting.', price:200, rating:4.8, veg:true, img:'https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&w=500&q=80'},
  {id:30, name:'Blueberry Cheesecake', cat:'Cakes', desc:'Silky cheesecake topped with a fresh blueberry compote.', price:220, rating:4.9, veg:true, img:'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=500&q=80'},
  {id:31, name:'Butter Croissant', cat:'Pastries', desc:'Flaky, buttery croissant baked fresh every morning.', price:130, rating:4.7, veg:true, img:'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80'},
  {id:32, name:'Almond Danish Pastry', cat:'Pastries', desc:'Sweet danish pastry topped with toasted almond flakes.', price:150, rating:4.6, veg:true, img:'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&w=500&q=80'}
];

const menuCategories = ['All','Coffee','Tea','Cold Coffee','Milkshakes','Mocktails','Fresh Juice','Pizza','Burger','Sandwich','Pasta','French Fries','Garlic Bread','Desserts','Ice Cream','Cakes','Pastries'];

let activeCategory = 'All';
let searchQuery = '';
let favourites = new Set();
let menuQuantities = {};
menuData.forEach(item => menuQuantities[item.id] = 1);

/* ---------- RENDER FILTER CHIPS ---------- */
const menuFiltersEl = document.getElementById('menuFilters');
menuCategories.forEach(cat => {
  const chip = document.createElement('div');
  chip.className = 'filter-chip' + (cat === 'All' ? ' active' : '');
  chip.textContent = cat;
  chip.addEventListener('click', () => {
    activeCategory = cat;
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    renderMenu();
  });
  menuFiltersEl.appendChild(chip);
});

document.getElementById('menuSearch').addEventListener('input', (e) => {
  searchQuery = e.target.value.toLowerCase().trim();
  renderMenu();
});

/* ---------- RENDER MENU CARDS ---------- */
function renderMenu(){
  const grid = document.getElementById('menuGrid');
  grid.innerHTML = '';
  const filtered = menuData.filter(item => {
    const matchCat = activeCategory === 'All' || item.cat === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery) || item.cat.toLowerCase().includes(searchQuery);
    return matchCat && matchSearch;
  });

  if(filtered.length === 0){
    grid.innerHTML = '<div class="no-results"><i class="fa-solid fa-magnifying-glass" style="font-size:2.5rem;margin-bottom:14px;display:block;"></i>No items found. Try a different search or category.</div>';
    return;
  }

  filtered.forEach(item => {
    const qty = menuQuantities[item.id];
    const isFav = favourites.has(item.id);
    const card = document.createElement('div');
    card.className = 'menu-card reveal';
    card.innerHTML = `
      <div class="menu-card-img">
        <img src="${item.img}" alt="${item.name}" loading="lazy">
        <div class="veg-badge ${item.veg ? '' : 'nonveg'}"></div>
        <button class="fav-btn ${isFav ? 'active' : ''}" data-id="${item.id}"><i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i></button>
        ${item.badge ? `<div class="menu-card-badge">${item.badge}</div>` : ''}
      </div>
      <div class="menu-card-body">
        <div class="menu-card-top"><h3>${item.name}</h3><span class="menu-price">₹${item.price}</span></div>
        <p>${item.desc}</p>
        <div class="menu-rating"><i class="fa-solid fa-star"></i> ${item.rating} <span>(${Math.floor(item.rating*40)} ratings)</span></div>
        <div class="menu-card-footer">
          <div class="qty-selector">
            <button class="qty-minus" data-id="${item.id}">−</button>
            <span id="qty-${item.id}">${qty}</span>
            <button class="qty-plus" data-id="${item.id}">+</button>
          </div>
          <button class="add-cart-btn" data-id="${item.id}"><i class="fa-solid fa-cart-plus"></i> Add</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  // Re-observe reveal animations for new cards
  document.querySelectorAll('#menuGrid .reveal').forEach(el => revealObserver.observe(el));

  // Attach events
  grid.querySelectorAll('.qty-plus').forEach(btn => btn.addEventListener('click', () => {
    const id = parseInt(btn.dataset.id);
    menuQuantities[id]++;
    document.getElementById('qty-' + id).textContent = menuQuantities[id];
  }));
  grid.querySelectorAll('.qty-minus').forEach(btn => btn.addEventListener('click', () => {
    const id = parseInt(btn.dataset.id);
    if(menuQuantities[id] > 1) menuQuantities[id]--;
    document.getElementById('qty-' + id).textContent = menuQuantities[id];
  }));
  grid.querySelectorAll('.add-cart-btn').forEach(btn => btn.addEventListener('click', () => {
    const id = parseInt(btn.dataset.id);
    const item = menuData.find(m => m.id === id);
    addToCart(item, menuQuantities[id]);
    menuQuantities[id] = 1;
    document.getElementById('qty-' + id).textContent = 1;
  }));
  grid.querySelectorAll('.fav-btn').forEach(btn => btn.addEventListener('click', () => {
    const id = parseInt(btn.dataset.id);
    if(favourites.has(id)){ favourites.delete(id); } else { favourites.add(id); showToast('Added to favourites', 'success', 'fa-heart'); }
    renderMenu();
  }));
}
renderMenu();

/* =====================================================================
   SHOPPING CART
   ===================================================================== */
let cart = [];
const GST_RATE = 0.05;

function addToCart(item, qty){
  const existing = cart.find(c => c.id === item.id);
  if(existing){
    existing.qty += qty;
  } else {
    cart.push({...item, qty});
  }
  renderCart();
  showToast(`${item.name} added to cart`, 'success', 'fa-cart-plus');
}

function removeFromCart(id){
  cart = cart.filter(c => c.id !== id);
  renderCart();
}

function changeCartQty(id, delta){
  const item = cart.find(c => c.id === id);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0){ removeFromCart(id); return; }
  renderCart();
}

function renderCart(){
  const container = document.getElementById('cartItemsContainer');
  const summary = document.getElementById('cartSummary');
  const cartCount = document.getElementById('cartCount');

  const totalQty = cart.reduce((sum, c) => sum + c.qty, 0);
  cartCount.textContent = totalQty;

  if(cart.length === 0){
    container.innerHTML = `<div class="cart-empty"><i class="fa-solid fa-bag-shopping"></i><p>Your cart is empty.<br>Add some delicious items!</p></div>`;
    summary.style.display = 'none';
    return;
  }

  summary.style.display = 'block';
  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.name}">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <div class="price">₹${item.price} x ${item.qty} = ₹${item.price * item.qty}</div>
        <div class="cart-item-actions">
          <div class="qty-selector">
            <button onclick="changeCartQty(${item.id}, -1)">−</button>
            <span>${item.qty}</span>
            <button onclick="changeCartQty(${item.id}, 1)">+</button>
          </div>
          <div class="cart-item-remove" onclick="removeFromCart(${item.id})"><i class="fa-solid fa-trash"></i> Remove</div>
        </div>
      </div>
    </div>
  `).join('');

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const gst = subtotal * GST_RATE;
  const grandTotal = subtotal + gst;

  document.getElementById('cartSubtotal').textContent = '₹' + subtotal.toFixed(2);
  document.getElementById('cartGst').textContent = '₹' + gst.toFixed(2);
  document.getElementById('cartGrandTotal').textContent = '₹' + grandTotal.toFixed(2);
}
renderCart();

/* ---------- CART DRAWER TOGGLE ---------- */
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
function openCart(){ cartDrawer.classList.add('open'); cartOverlay.classList.add('open'); }
function closeCart(){ cartDrawer.classList.remove('open'); cartOverlay.classList.remove('open'); }
document.getElementById('cartBtn').addEventListener('click', openCart);
document.getElementById('cartClose').addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

/* ---------- CHECKOUT ---------- */
document.getElementById('checkoutBtn').addEventListener('click', () => {
  if(cart.length === 0) return;
  const orderId = 'CGO-' + Math.floor(100000 + Math.random()*900000);
  document.getElementById('orderIdDisplay').textContent = orderId;
  closeCart();
  document.getElementById('orderConfirmModal').classList.add('open');
});
document.getElementById('orderConfirmClose').addEventListener('click', closeOrderConfirm);
document.getElementById('orderConfirmDone').addEventListener('click', closeOrderConfirm);
function closeOrderConfirm(){
  document.getElementById('orderConfirmModal').classList.remove('open');
  cart = [];
  renderCart();
}

/* =====================================================================
   RESERVATION FORM
   ===================================================================== */
const reservationForm = document.getElementById('reservationForm');
function resetReservationForm(){
  reservationForm.reset();
  reservationForm.style.display = 'block';
  document.getElementById('reserveSuccess').classList.remove('show');
}

/* =====================================================================
   REVIEWS
   ===================================================================== */
let reviewsData = [
  {name:'Sarah Mitchell', img:'https://randomuser.me/api/portraits/women/44.jpg', rating:5, date:'July 28, 2026', text:'Absolutely stunning ambience! The Ocean Blue Latte is a work of art and tastes even better than it looks. Will definitely be back.'},
  {name:'James Carter', img:'https://randomuser.me/api/portraits/men/32.jpg', rating:5, date:'July 22, 2026', text:'Best beachside cafe experience I have had. The outdoor seating with the sound of waves made it unforgettable.'},
  {name:'Priya Sharma', img:'https://randomuser.me/api/portraits/women/68.jpg', rating:4, date:'July 15, 2026', text:'Loved the desserts, especially the molten lava cake. Service was fast and the staff were extremely friendly.'},
  {name:'Daniel Wu', img:'https://randomuser.me/api/portraits/men/76.jpg', rating:5, date:'July 10, 2026', text:'The reservation system was so smooth, and the table by the window had the perfect sunset view. Highly recommend!'},
  {name:'Emily Rodriguez', img:'https://randomuser.me/api/portraits/women/21.jpg', rating:5, date:'June 30, 2026', text:'A luxurious escape from the city. Every detail from the decor to the coffee cups felt premium and thoughtful.'},
  {name:'Arjun Mehta', img:'https://randomuser.me/api/portraits/men/54.jpg', rating:4, date:'June 24, 2026', text:'Great variety on the menu and reasonable prices for the quality. The mocktails are a must try!'}
];

function computeAverageRating(){
  const total = reviewsData.reduce((sum, r) => sum + r.rating, 0);
  return (total / reviewsData.length).toFixed(1);
}

function renderReviews(){
  const grid = document.getElementById('reviewsGrid');
  grid.innerHTML = reviewsData.map(r => `
    <div class="review-card reveal">
      <i class="fa-solid fa-quote-right quote-icon"></i>
      <div class="review-head">
        <img src="${r.img}" alt="${r.name}">
        <div><h4>${r.name}</h4><span>${r.date}</span></div>
      </div>
      <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
      <p>${r.text}</p>
    </div>
  `).join('');
  document.querySelectorAll('#reviewsGrid .reveal').forEach(el => revealObserver.observe(el));

  const avg = computeAverageRating();
  document.getElementById('avgRatingNum').textContent = avg;
  document.getElementById('avgStars').textContent = '★'.repeat(Math.round(avg)) + '☆'.repeat(5-Math.round(avg));
  document.getElementById('avgCount').textContent = `Based on ${reviewsData.length} reviews`;
}
renderReviews();

/* ---------- STAR RATING INPUT ---------- */
let selectedRating = 0;
const starInputEls = document.querySelectorAll('#starInput i');
starInputEls.forEach(star => {
  star.addEventListener('click', () => {
    selectedRating = parseInt(star.dataset.val);
    starInputEls.forEach(s => s.classList.toggle('selected', parseInt(s.dataset.val) <= selectedRating));
  });
});



/* =====================================================================
   GALLERY + LIGHTBOX
   ===================================================================== */
const galleryData = [
  {cat:'Interior', label:'Cafe Interior', img:'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=800&q=80'},
  {cat:'Coffee', label:'Signature Coffee', img:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80'},
  {cat:'Food', label:'Fresh Food', img:'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80'},
  {cat:'Desserts', label:'Sweet Desserts', img:'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80'},
  {cat:'Drinks', label:'Chilled Drinks', img:'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&q=80'},
  {cat:'Outdoor', label:'Outdoor Seating', img:'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800&q=80'},
  {cat:'Decor', label:'Beach Decor', img:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'},
  {cat:'Interior', label:'Lounge Area', img:'https://images.unsplash.com/photo-1493857671505-72967e2e2760?auto=format&fit=crop&w=800&q=80'},
  {cat:'Coffee', label:'Latte Art', img:'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80'},
  {cat:'Food', label:'Gourmet Plating', img:'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80'},
  {cat:'Outdoor', label:'Sunset Deck', img:'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=800&q=80'},
  {cat:'Decor', label:'Ocean Waves', img:'https://images.unsplash.com/photo-1505142468610-359e7d316be0?auto=format&fit=crop&w=800&q=80'}
];
const galleryCategories = ['All','Interior','Coffee','Food','Desserts','Drinks','Outdoor','Decor'];
let activeGalleryCat = 'All';

const galleryFiltersEl = document.getElementById('galleryFilters');
galleryCategories.forEach(cat => {
  const chip = document.createElement('div');
  chip.className = 'filter-chip' + (cat === 'All' ? ' active' : '');
  chip.textContent = cat;
  chip.addEventListener('click', () => {
    activeGalleryCat = cat;
    document.querySelectorAll('#galleryFilters .filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    renderGallery();
  });
  galleryFiltersEl.appendChild(chip);
});

let currentGalleryList = [];
let currentLightboxIndex = 0;

function renderGallery(){
  const grid = document.getElementById('galleryGrid');
  const filtered = activeGalleryCat === 'All' ? galleryData : galleryData.filter(g => g.cat === activeGalleryCat);
  currentGalleryList = filtered;
  grid.innerHTML = filtered.map((g, i) => `
    <div class="gallery-item reveal" data-index="${i}">
      <img src="${g.img}" alt="${g.label}" loading="lazy">
      <div class="gallery-overlay"><span><i class="fa-solid fa-expand"></i> ${g.label}</span></div>
    </div>
  `).join('');
  document.querySelectorAll('#galleryGrid .reveal').forEach(el => revealObserver.observe(el));
  grid.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => openLightbox(parseInt(item.dataset.index)));
  });
}
renderGallery();

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
function openLightbox(index){
  currentLightboxIndex = index;
  lightboxImg.src = currentGalleryList[index].img;
  lightbox.classList.add('open');
}
document.getElementById('lightboxClose').addEventListener('click', () => lightbox.classList.remove('open'));
lightbox.addEventListener('click', (e) => { if(e.target === lightbox) lightbox.classList.remove('open'); });
document.getElementById('lightboxNext').addEventListener('click', () => {
  currentLightboxIndex = (currentLightboxIndex + 1) % currentGalleryList.length;
  lightboxImg.src = currentGalleryList[currentLightboxIndex].img;
});
document.getElementById('lightboxPrev').addEventListener('click', () => {
  currentLightboxIndex = (currentLightboxIndex - 1 + currentGalleryList.length) % currentGalleryList.length;
  lightboxImg.src = currentGalleryList[currentLightboxIndex].img;
});
document.addEventListener('keydown', (e) => {
  if(!lightbox.classList.contains('open')) return;
  if(e.key === 'Escape') lightbox.classList.remove('open');
  if(e.key === 'ArrowRight') document.getElementById('lightboxNext').click();
  if(e.key === 'ArrowLeft') document.getElementById('lightboxPrev').click();
});

/* =====================================================================
   SPECIAL OFFERS + COUNTDOWN
   ===================================================================== */
const offersData = [
  {icon:'fa-umbrella-beach', title:'Weekend Beach Special', desc:'Enjoy 20% off on all beverages every Saturday & Sunday.', badge:'20% OFF', cls:'c1', hours:48},
  {icon:'fa-graduation-cap', title:'Student Discount', desc:'Flat 15% off for students with a valid college ID card.', badge:'15% OFF', cls:'c2', hours:120},
  {icon:'fa-gift', title:'Buy One Get One', desc:'BOGO on all mocktails and milkshakes, every Wednesday.', badge:'BOGO', cls:'c3', hours:72},
  {icon:'fa-star', title:'Festival Offer', desc:'Celebrate with us — 25% off on all desserts this festive season.', badge:'25% OFF', cls:'c4', hours:96},
  {icon:'fa-sun', title:'Seasonal Summer Deal', desc:'Cool down with 10% off on all cold beverages all summer long.', badge:'10% OFF', cls:'c5', hours:200}
];

function renderOffers(){
  const grid = document.getElementById('offersGrid');
  grid.innerHTML = offersData.map((o, i) => `
    <div class="offer-card ${o.cls} reveal">
      <div class="offer-badge">${o.badge}</div>
      <i class="fa-solid ${o.icon} offer-icon"></i>
      <h3>${o.title}</h3>
      <p>${o.desc}</p>
      <div class="offer-countdown" id="countdown-${i}">
        <div class="cd-box"><strong class="cd-d">0</strong><span>Days</span></div>
        <div class="cd-box"><strong class="cd-h">0</strong><span>Hrs</span></div>
        <div class="cd-box"><strong class="cd-m">0</strong><span>Min</span></div>
        <div class="cd-box"><strong class="cd-s">0</strong><span>Sec</span></div>
      </div>
    </div>
  `).join('');
  document.querySelectorAll('#offersGrid .reveal').forEach(el => revealObserver.observe(el));
}
renderOffers();

const offerDeadlines = offersData.map(o => Date.now() + o.hours * 60 * 60 * 1000);
function updateCountdowns(){
  offerDeadlines.forEach((deadline, i) => {
    const el = document.getElementById('countdown-' + i);
    if(!el) return;
    let diff = deadline - Date.now();
    if(diff < 0){
      offerDeadlines[i] = Date.now() + offersData[i].hours * 60 * 60 * 1000;
      diff = offerDeadlines[i] - Date.now();
    }
    const d = Math.floor(diff / (1000*60*60*24));
    const h = Math.floor((diff / (1000*60*60)) % 24);
    const m = Math.floor((diff / (1000*60)) % 60);
    const s = Math.floor((diff / 1000) % 60);
    el.querySelector('.cd-d').textContent = String(d).padStart(2,'0');
    el.querySelector('.cd-h').textContent = String(h).padStart(2,'0');
    el.querySelector('.cd-m').textContent = String(m).padStart(2,'0');
    el.querySelector('.cd-s').textContent = String(s).padStart(2,'0');
  });
}
updateCountdowns();
setInterval(updateCountdowns, 1000);

/* =====================================================================
   LOGIN / SIGNUP MODAL
   ===================================================================== */
const loginModal = document.getElementById('loginModal');
document.getElementById('loginBtn').addEventListener('click', () => loginModal.classList.add('open'));
document.getElementById('modalClose').addEventListener('click', () => loginModal.classList.remove('open'));
loginModal.addEventListener('click', (e) => { if(e.target === loginModal) loginModal.classList.remove('open'); });

let isSignupMode = false;
function toggleAuthMode(){
  isSignupMode = !isSignupMode;
  document.getElementById('authTitle').textContent = isSignupMode ? 'Create Account' : 'Welcome Back';
  document.getElementById('authSubtitle').textContent = isSignupMode ? 'Sign up to join Cafe Guide' : 'Login to Cafe Guide to continue';
  document.getElementById('confirmGroup').style.display = isSignupMode ? 'block' : 'none';
  document.getElementById('loginExtras').style.display = isSignupMode ? 'none' : 'flex';
  document.getElementById('authSubmitBtn').innerHTML = isSignupMode ? '<i class="fa-solid fa-user-plus"></i> Sign Up' : '<i class="fa-solid fa-right-to-bracket"></i> Login';
  document.getElementById('authSwitch').innerHTML = isSignupMode
    ? 'Already have an account? <a href="#" id="switchToSignup">Login</a>'
    : "Don't have an account? <a href=\"#\" id=\"switchToSignup\">Sign Up</a>";
  document.getElementById('switchToSignup').addEventListener('click', (e) => { e.preventDefault(); toggleAuthMode(); });
}
window.setAuthLoginMode = () => { if(isSignupMode) toggleAuthMode(); };
document.getElementById('switchToSignup').addEventListener('click', (e) => { e.preventDefault(); toggleAuthMode(); });


/* =====================================================================
   CONTACT FORM + NEWSLETTER
   ===================================================================== */


/* ---------- FOOTER YEAR ---------- */
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- MIN DATE FOR RESERVATION ---------- */
const resDateInput = document.getElementById('resDate');
if(resDateInput){
  const today = new Date().toISOString().split('T')[0];
  resDateInput.setAttribute('min', today);
}

window.CafeGuideMenuData = menuData;
window.CafeGuideRenderMenu = renderMenu;
