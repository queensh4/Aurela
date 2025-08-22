// Data produk (bisa diganti sesuai kebutuhan)
const PRODUCTS = [
  {id: 'drs01', name: 'Aurora Satin Dress', price: 349000, image: 'assets/dress1.png'},
  {id: 'top01', name: 'Luna Pleats Blouse', price: 199000, image: 'assets/top.png'},
  {id: 'skrt1', name: 'Serene Midi Skirt', price: 229000, image: 'assets/skirt-1.svg'},
  {id: 'set01', name: 'Azure Lounge Set', price: 289000, image: 'assets/set-1.svg'},
  {id: 'bag01', name: 'Copper Mini Bag', price: 259000, image: 'assets/bag-1.svg'},
  {id: 'ootd1', name: 'Everyday Cardigan', price: 179000, image: 'assets/cardigan-1.svg'},
  {id: 'den01', name: 'Cloudy Wide Jeans', price: 279000, image: 'assets/jeans-1.svg'},
  {id: 'srt01', name: 'Soft Basic Tee', price: 129000, image: 'assets/tee-1.svg'},
];

// Util
const formatIDR = n => 'Rp' + n.toLocaleString('id-ID');

// LocalStorage Cart
function getCart() { return JSON.parse(localStorage.getItem('aurela_cart') || '[]'); }
function saveCart(cart) { localStorage.setItem('aurela_cart', JSON.stringify(cart)); updateCartCount(); }
function cartTotal(cart) { return cart.reduce((s,i)=> s + i.price * i.qty, 0); }

function addToCart(id) {
  const cart = getCart();
  const p = PRODUCTS.find(x => x.id === id);
  const exist = cart.find(x => x.id === id);
  if (exist) exist.qty += 1;
  else cart.push({id: p.id, name: p.name, price: p.price, image: p.image, qty: 1});
  saveCart(cart);
  openCartDrawer();
  renderCart();
}

function removeFromCart(id) {
  let cart = getCart().filter(x => x.id !== id);
  saveCart(cart);
  renderCart();
}

function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find(x => x.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart(cart);
  renderCart();
}

function updateCartCount() {
  const c = getCart().reduce((s,i)=> s + i.qty, 0);
  const el = document.getElementById('cartCount');
  if (el) el.textContent = c;
}

// Slider init
function initSlider() {
  const featured = PRODUCTS.slice(0, 5);
  const slidesEl = document.getElementById('slides');
  const dotsEl = document.getElementById('dots');
  if (!slidesEl || !dotsEl) return;
  slidesEl.innerHTML = `<div class="track">${featured.map(p => `
    <article class="slide">
      <div class="txt">
        <span class="eyebrow">Best Seller</span>
        <h3>${p.name}</h3>
        <p>Material nyaman, potongan elegan — cocok untuk aktivitas harian maupun acara spesial.</p>
        <div class="price-row">
          <span class="price">${formatIDR(p.price)}</span>
          <button class="btn primary" onclick="addToCart('${p.id}')">Tambah ke Keranjang</button>
        </div>
      </div>
      <div class="img"><img src="${p.image}" alt="${p.name}"></div>
    </article>
  `).join('')}</div>`;

  dotsEl.innerHTML = featured.map((_,i)=>`<button data-i="${i}"></button>`).join('');
  let idx = 0;
  const track = slidesEl.querySelector('.track');
  const dots = [...dotsEl.querySelectorAll('button')];
  const setIdx = (i)=>{
    idx = (i + featured.length) % featured.length;
    track.style.transform = `translateX(-${idx * 100}%)`;
    dots.forEach((d,j)=> d.classList.toggle('active', j===idx));
  }
  setIdx(0);

  document.querySelector('.slide-nav.prev').onclick = ()=> setIdx(idx-1);
  document.querySelector('.slide-nav.next').onclick = ()=> setIdx(idx+1);
  dots.forEach((d,i)=> d.onclick = ()=> setIdx(i));

  // auto-play
  setInterval(()=> setIdx(idx+1), 5000);
}

// Grid init
function initGrid() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  grid.innerHTML = PRODUCTS.map(p => `
    <article class="card product" data-animate>
      <div class="thumb"><img src="${p.image}" alt="${p.name}"></div>
      <h4>${p.name}</h4>
      <div class="price-row">
        <span class="price-tag">${formatIDR(p.price)}</span>
        <span>⭐ 4.{Math.floor(Math.random()*5)+3}</span>
      </div>
      <div class="add"><button onclick="addToCart('${p.id}')">Tambah ke Keranjang</button></div>
    </article>
  `).join('');
}

// Cart drawer UI
let drawer, overlay;
function openCartDrawer() {
  drawer = drawer || document.getElementById('cartDrawer');
  overlay = overlay || document.getElementById('overlay');
  drawer.classList.add('open'); overlay.classList.add('show');
  drawer.setAttribute('aria-hidden', 'false');
}
function closeCartDrawer() {
  drawer.classList.remove('open'); overlay.classList.remove('show');
  drawer.setAttribute('aria-hidden', 'true');
}
function renderCart() {
  const itemsEl = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  if (!itemsEl || !totalEl) return;
  const cart = getCart();
  if (cart.length === 0) {
    itemsEl.innerHTML = `<p>Keranjang kamu kosong. Yuk mulai belanja!</p>`;
    totalEl.textContent = 'Rp0';
    return;
  }
  itemsEl.innerHTML = cart.map(i => `
    <div class="cart-item">
      <img src="${i.image}" alt="${i.name}">
      <div>
        <div style="font-weight:600">${i.name}</div>
        <div style="color:#B87333">${formatIDR(i.price)}</div>
        <div class="qty">
          <button onclick="changeQty('${i.id}', -1)">−</button>
          <span>${i.qty}</span>
          <button onclick="changeQty('${i.id}', 1)">+</button>
          <button style="margin-left:.5rem" onclick="removeFromCart('${i.id}')">Hapus</button>
        </div>
      </div>
      <div style="font-weight:600">${formatIDR(i.price * i.qty)}</div>
    </div>
  `).join('');
  totalEl.textContent = formatIDR(cartTotal(cart));
}

// Checkout page logic
function initCheckout() {
  const orderItems = document.getElementById('orderItems');
  if (!orderItems) return; // not on checkout page

  const cart = getCart();
  if (cart.length === 0) {
    orderItems.innerHTML = '<p>Keranjang kosong. <a href="index.html">Belanja sekarang</a>.</p>';
    document.getElementById('toPayment').disabled = true;
    return;
  }
  orderItems.innerHTML = cart.map(i => `
    <div class="order-item">
      <img src="${i.image}" alt="${i.name}">
      <div>${i.name} × ${i.qty}</div>
      <div style="margin-left:auto">${formatIDR(i.price * i.qty)}</div>
    </div>
  `).join('');
  const subtotal = cartTotal(cart);
  const ship = 20000;
  document.getElementById('orderSubtotal').textContent = formatIDR(subtotal);
  document.getElementById('orderShip').textContent = formatIDR(ship);
  document.getElementById('orderTotal').textContent = formatIDR(subtotal + ship);

  const steps = [...document.querySelectorAll('.progress-step')];
  const activate = n => steps.forEach((s,i)=>{
    s.classList.toggle('active', i===n-1);
    s.classList.toggle('done', i<n-1);
  });

  const toPayment = document.getElementById('toPayment');
  const shipForm = document.getElementById('shipForm');
  const paymentSection = document.getElementById('paymentSection');
  const placeOrder = document.getElementById('placeOrder');
  const successSection = document.getElementById('successSection');

  toPayment.addEventListener('click', () => {
    if (!shipForm.reportValidity()) return;
    paymentSection.classList.remove('hidden');
    activate(3);
    window.scrollTo({top: paymentSection.offsetTop - 80, behavior: 'smooth'});
  });

  placeOrder.addEventListener('click', () => {
    activate(4);
    successSection.classList.remove('hidden');
    localStorage.removeItem('aurela_cart');
  });
}

// Reveal on scroll
function initReveal() {
  const els = document.querySelectorAll('[data-animate]');
  const obs = new IntersectionObserver((entries)=> {
    entries.forEach(e=>{
      if (e.isIntersecting) {
        e.target.animate([
          {opacity: 0, transform: 'translateY(12px)'},
          {opacity: 1, transform: 'translateY(0)'}
        ], {duration: 500, easing: 'cubic-bezier(.2,.6,.2,1)', fill: 'forwards'});
        obs.unobserve(e.target);
      }
    });
  }, {threshold: 0.2});
  els.forEach(el=> obs.observe(el));
}

// Cart drawer bindings (only on index page)
function initCartUI() {
  const open = document.getElementById('openCart');
  const close = document.getElementById('closeCart');
  const overlay = document.getElementById('overlay');
  if (!open || !close || !overlay) return;
  open.addEventListener('click', () => { openCartDrawer(); renderCart(); });
  close.addEventListener('click', closeCartDrawer);
  overlay.addEventListener('click', closeCartDrawer);
}

document.addEventListener('DOMContentLoaded', () => {
  initSlider();
  initGrid();
  initCartUI();
  initReveal();
  initCheckout();
  renderCart();
  updateCartCount();
});
