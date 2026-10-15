// ===== LOAD PRODUCTS FROM ADMIN (localStorage) OR DEFAULT =====
(function loadProductsFromAdmin() {
  const stored = localStorage.getItem('hoodculture_products');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Override the global products array
        products.length = 0;
        parsed.forEach(p => products.push(p));
      }
    } catch (e) {}
  }
})();

// ===== CART STATE =====
let cart = JSON.parse(localStorage.getItem('hoodculture_cart')) || [];

// ===== DOM ELEMENTS =====
const cartBtn = document.getElementById('cartBtn');
const closeCart = document.getElementById('closeCart');
const cartSidebar = document.getElementById('cartSidebar');
const overlay = document.getElementById('overlay');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  renderFeatured();
  renderShop();
  setupFilters();
  injectWhatsApp();
});

// ===== MOBILE MENU =====
if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
  });
}

// ===== CART OPEN / CLOSE =====
if (cartBtn) {
  cartBtn.addEventListener('click', openCart);
}
if (closeCart) {
  closeCart.addEventListener('click', closeCartSidebar);
}
if (overlay) {
  overlay.addEventListener('click', closeCartSidebar);
}

function openCart() {
  cartSidebar.classList.add('open');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCartSidebar() {
  cartSidebar.classList.remove('open');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ===== ADD TO CART (from product cards - opens product page for size) =====
function addToCart(id) {
  // Redirect to product page so user can select size
  window.location.href = `product.html?id=${id}`;
}

// ===== REMOVE FROM CART =====
function removeFromCart(id, size) {
  cart = cart.filter(item => !(item.id === id && item.size === size));
  saveCart();
  updateCartUI();
}

// ===== SAVE / LOAD =====
function saveCart() {
  localStorage.setItem('hoodculture_cart', JSON.stringify(cart));
}

// ===== UPDATE CART UI =====
function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  if (cartCount) cartCount.textContent = totalItems;

  if (cartItems) {
    if (cart.length === 0) {
      cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    } else {
      cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
          <div class="cart-item-img" style="overflow:hidden;">
            ${item.image ? `<img src="${item.image}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.textContent='HC'">` : 'HC'}
          </div>
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <p>Size: ${item.size || '—'} | ₹${item.price.toLocaleString()} × ${item.qty}</p>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id}, '${item.size || ''}')">Remove</button>
          </div>
        </div>
      `).join('');
    }
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  if (cartTotal) cartTotal.textContent = `₹${total.toLocaleString()}`;
}

// ===== RENDER PRODUCTS =====
function createProductCard(product) {
  const imgHtml = product.image
    ? `<img src="${product.image}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.innerHTML='<span>HC</span>'">`
    : `<span>HC</span>`;
  return `
    <div class="product-card" data-category="${product.category}">
      <a href="product.html?id=${product.id}" class="product-img-link">
        <div class="product-img">
          ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
          ${imgHtml}
        </div>
      </a>
      <div class="product-info">
        <p class="category">${product.category}</p>
        <a href="product.html?id=${product.id}"><h3>${product.name}</h3></a>
        <div class="product-bottom">
          <span class="price">₹${product.price.toLocaleString()}</span>
          <a href="https://mydukaan.io/hoodculture" target="_blank" class="add-btn" style="text-decoration:none;">Buy</a>
        </div>
      </div>
    </div>
  `;
}

function renderFeatured() {
  const container = document.getElementById('featuredProducts');
  if (!container) return;
  
  const featured = products.filter(p => p.featured);
  container.innerHTML = featured.map(createProductCard).join('');
}

function renderShop(filter = 'all') {
  const container = document.getElementById('shopProducts');
  if (!container) return;

  const filtered = filter === 'all' 
    ? products 
    : products.filter(p => p.category === filter);

  container.innerHTML = filtered.map(createProductCard).join('');
}

// ===== FILTERS =====
function setupFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderShop(btn.dataset.filter);
    });
  });
}

// ===== WHATSAPP FLOAT BUTTON =====
function injectWhatsApp() {
  // Only inject if not already present (product page has its own)
  if (document.querySelector('.whatsapp-float')) return;

  const settings = JSON.parse(localStorage.getItem('hoodculture_settings') || '{}');
  const waNum = settings.whatsapp || '919876543210';
  const a = document.createElement('a');
  a.href = 'https://wa.me/' + waNum + '?text=Hi%20HoodCulture!%20I%20want%20to%20order';
  a.className = 'whatsapp-float';
  a.target = '_blank';
  a.title = 'Order on WhatsApp';
  a.innerHTML = `
    <svg viewBox="0 0 32 32" width="28" height="28" fill="white">
      <path d="M16.1 2.1C8.5 2.1 2.3 8.3 2.3 15.9c0 2.5.7 4.9 1.9 7L2 30l7.3-1.9c2 1.1 4.3 1.7 6.7 1.7 7.6 0 13.8-6.2 13.8-13.8S23.7 2.1 16.1 2.1zm0 25.2c-2.2 0-4.3-.6-6.1-1.6l-.4-.3-4.3 1.1 1.1-4.2-.3-.4c-1.2-1.9-1.8-4.1-1.8-6.4 0-6.4 5.2-11.6 11.6-11.6s11.6 5.2 11.6 11.6-5.2 11.6-11.6 11.6zm6.4-8.7c-.3-.2-2-1-2.3-1.1-.3-.1-.5-.2-.8.2s-1 1.1-1.2 1.3c-.2.2-.4.3-.8.1s-1.5-.6-2.9-1.8c-1.1-1-1.8-2.2-2-2.5-.2-.3 0-.5.2-.7.2-.2.3-.4.5-.6.2-.2.2-.3.3-.5.1-.2 0-.4 0-.6s-.8-1.9-1.1-2.6c-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.5c.2.2 2.4 3.6 5.7 5.1 2.1.9 2.9 1 3.9.8.6-.1 2-0.8 2.3-1.6.3-.8.3-1.5.2-1.6-.1-.2-.3-.2-.6-.4z"/>
    </svg>
  `;
  document.body.appendChild(a);
}
