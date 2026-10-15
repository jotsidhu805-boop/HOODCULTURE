// ===== PRODUCT DETAIL PAGE =====

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'));

  if (!id) {
    window.location.href = 'shop.html';
    return;
  }

  const product = products.find(p => p.id === id);
  if (!product) {
    window.location.href = 'shop.html';
    return;
  }

  renderProduct(product);
  renderRelated(product);
});

let selectedSize = null;

function renderProduct(product) {
  document.title = `${product.name} | HoodCulture`;
  document.getElementById('breadcrumbName').textContent = product.name;

  const sizesHtml = product.sizes.map((size, i) => `
    <button class="size-btn ${i === 0 ? 'active' : ''}" data-size="${size}" onclick="selectSize(this, '${size}')">
      ${size}
    </button>
  `).join('');

  // Pre-select first size
  selectedSize = product.sizes[0];

  document.getElementById('productDetail').innerHTML = `
    <div class="product-gallery">
      <div class="main-image">
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
        ${product.image
          ? `<img src="${product.image}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;" onerror="this.outerHTML='<span class=\'placeholder-logo\'>HC</span>'">`
          : `<span class="placeholder-logo">HC</span>`}
      </div>
    </div>
    <div class="product-info-detail">
      <p class="product-category">${product.category}</p>
      <h1>${product.name}</h1>
      <div class="product-price">₹${product.price.toLocaleString()}</div>
      <p class="product-desc">${product.description}</p>
      
      <div class="size-section">
        <div class="size-header">
          <span>Select Size</span>
          <span class="size-guide">Size Guide</span>
        </div>
        <div class="size-options">
          ${sizesHtml}
        </div>
      </div>

      <div class="product-actions">
        <a href="https://mydukaan.io/hoodculture" target="_blank" class="btn btn-primary" style="text-align:center;">
          Buy Now on Store
        </a>
        <a href="https://wa.me/919876543210?text=Hi%20HoodCulture!%20I%20want%20to%20order%20${encodeURIComponent(product.name)}" 
           class="btn btn-outline whatsapp-order-btn" target="_blank">
          Order on WhatsApp
        </a>
      </div>

      <div class="product-meta">
        <p>✓ Free shipping above ₹1999</p>
        <p>✓ Easy 7-day returns</p>
        <p>✓ COD available</p>
      </div>
    </div>
  `;
}

function selectSize(btn, size) {
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedSize = size;
}

function addToCartWithSize(id) {
  if (!selectedSize) {
    alert('Please select a size');
    return;
  }

  const product = products.find(p => p.id === id);
  if (!product) return;

  // Check if same product + same size already in cart
  const existing = cart.find(item => item.id === id && item.size === selectedSize);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      ...product,
      size: selectedSize,
      qty: 1
    });
  }

  saveCart();
  updateCartUI();

  // Feedback
  const btn = document.querySelector('.add-to-cart-btn');
  const original = btn.textContent;
  btn.textContent = 'Added ✓';
  btn.style.background = '#2ecc71';
  setTimeout(() => {
    btn.textContent = original;
    btn.style.background = '';
  }, 1200);
}

function renderRelated(current) {
  const related = products
    .filter(p => p.category === current.category && p.id !== current.id)
    .slice(0, 4);

  const container = document.getElementById('relatedProducts');
  if (!container) return;

  if (related.length === 0) {
    // fallback to featured
    container.innerHTML = products.filter(p => p.featured && p.id !== current.id)
      .slice(0, 4)
      .map(createProductCard)
      .join('');
  } else {
    container.innerHTML = related.map(createProductCard).join('');
  }
}
