// ===== ADMIN PANEL =====

const DEFAULT_PASS = 'hoodadmin';

// Get settings
function getSettings() {
  return JSON.parse(localStorage.getItem('hoodculture_settings')) || {
    businessName: 'HoodCulture',
    whatsapp: '919876543210',
    upi: '',
    shipping: 99,
    password: DEFAULT_PASS,
    email: 'hello@hoodculture.in'
  };
}

function saveSettingsToStorage(s) {
  localStorage.setItem('hoodculture_settings', JSON.stringify(s));
}

// Get products (from localStorage or default)
function getAdminProducts() {
  const stored = localStorage.getItem('hoodculture_products');
  if (stored) return JSON.parse(stored);
  // Seed from default products array
  localStorage.setItem('hoodculture_products', JSON.stringify(products));
  return [...products];
}

function saveAdminProducts(list) {
  localStorage.setItem('hoodculture_products', JSON.stringify(list));
}

// Get orders
function getOrders() {
  return JSON.parse(localStorage.getItem('hoodculture_orders')) || [];
}

// ===== LOGIN =====
function tryLogin() {
  const pass = document.getElementById('adminPass').value;
  const settings = getSettings();
  if (pass === settings.password || pass === DEFAULT_PASS) {
    sessionStorage.setItem('hood_admin_auth', '1');
    showAdmin();
  } else {
    alert('Wrong password');
  }
}

function logout() {
  sessionStorage.removeItem('hood_admin_auth');
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('adminPanel').classList.remove('active');
}

function showAdmin() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminPanel').classList.add('active');
  loadDashboard();
  loadOrders();
  loadProducts();
  loadSettingsForm();
}

// Auto-login if session exists
document.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('hood_admin_auth') === '1') {
    showAdmin();
  }

  // Enter key on password
  document.getElementById('adminPass').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') tryLogin();
  });

  // Tabs
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    });
  });
});

// ===== DASHBOARD =====
function loadDashboard() {
  const orders = getOrders();
  const prods = getAdminProducts();
  const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pending = orders.filter(o => o.status === 'confirmed' || o.status === 'placed').length;

  document.getElementById('statOrders').textContent = orders.length;
  document.getElementById('statRevenue').textContent = '₹' + revenue.toLocaleString();
  document.getElementById('statProducts').textContent = prods.length;
  document.getElementById('statPending').textContent = pending;

  const recent = orders.slice().reverse().slice(0, 5);
  const container = document.getElementById('recentOrdersList');
  if (recent.length === 0) {
    container.innerHTML = '<p class="empty-state">No orders yet</p>';
  } else {
    container.innerHTML = renderOrdersTable(recent);
  }
}

// ===== ORDERS =====
function loadOrders() {
  const orders = getOrders().slice().reverse();
  const container = document.getElementById('allOrdersList');
  if (orders.length === 0) {
    container.innerHTML = '<p class="empty-state">No orders yet. Orders placed on this browser will appear here.</p>';
  } else {
    container.innerHTML = renderOrdersTable(orders, true);
  }
}

function renderOrdersTable(orders, full = false) {
  return `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Date</th>
          <th>Customer</th>
          <th>Total</th>
          <th>Payment</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${orders.map(o => `
          <tr>
            <td><strong>${o.id}</strong></td>
            <td>${o.date}</td>
            <td>${o.shipping?.name || '—'}<br><span style="font-size:11px;color:#666">${o.shipping?.phone || ''}</span></td>
            <td>₹${(o.total || 0).toLocaleString()}</td>
            <td style="text-transform:uppercase;font-size:12px;">${o.payment || '—'}</td>
            <td><span class="badge-sm badge-${o.status || 'confirmed'}">${o.status || 'confirmed'}</span></td>
            <td>
              <div class="action-btns">
                <select class="btn-sm" onchange="updateOrderStatus('${o.id}', this.value)" style="padding:4px 8px;">
                  <option value="confirmed" ${o.status==='confirmed'?'selected':''}>Confirmed</option>
                  <option value="shipped" ${o.status==='shipped'?'selected':''}>Shipped</option>
                  <option value="out_for_delivery" ${o.status==='out_for_delivery'?'selected':''}>Out for Delivery</option>
                  <option value="delivered" ${o.status==='delivered'?'selected':''}>Delivered</option>
                </select>
                <button class="btn-sm" onclick="viewOrder('${o.id}')">View</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function updateOrderStatus(id, status) {
  let orders = getOrders();
  const idx = orders.findIndex(o => o.id === id);
  if (idx !== -1) {
    orders[idx].status = status;
    localStorage.setItem('hoodculture_orders', JSON.stringify(orders));
    loadOrders();
    loadDashboard();
  }
}

function viewOrder(id) {
  const order = getOrders().find(o => o.id === id);
  if (!order) return;
  const s = order.shipping || {};
  const items = (order.items || []).map(i => `• ${i.name} (${i.size || '—'}) × ${i.qty} = ₹${(i.price * i.qty).toLocaleString()}`).join('\n');
  alert(
    `Order: ${order.id}\n` +
    `Date: ${order.date}\n` +
    `Status: ${order.status}\n` +
    `Payment: ${order.payment}\n\n` +
    `Customer:\n${s.name}\n${s.phone}\n${s.email}\n${s.address}\n${s.city}, ${s.state} - ${s.pincode}\n\n` +
    `Items:\n${items}\n\n` +
    `Total: ₹${(order.total || 0).toLocaleString()}`
  );
}

// ===== PRODUCTS =====
function loadProducts() {
  const list = getAdminProducts();
  const container = document.getElementById('productsList');
  if (list.length === 0) {
    container.innerHTML = '<p class="empty-state">No products</p>';
    return;
  }
  container.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Category</th>
          <th>Price</th>
          <th>Sizes</th>
          <th>Featured</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${list.map(p => `
          <tr>
            <td>${p.id}</td>
            <td style="display:flex;align-items:center;gap:10px;">
              ${p.image ? `<img src="${p.image}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;background:#111;" onerror="this.style.display='none'">` : `<div style="width:40px;height:40px;background:#111;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#444;">HC</div>`}
              <strong>${p.name}</strong>${p.badge ? ` <span class="badge-sm" style="background:#39ff14;color:#000;">${p.badge}</span>` : ''}
            </td>
            <td style="text-transform:capitalize;">${p.category}</td>
            <td>₹${p.price.toLocaleString()}</td>
            <td style="font-size:12px;">${(p.sizes || []).join(', ')}</td>
            <td>${p.featured ? '✓' : '—'}</td>
            <td>
              <div class="action-btns">
                <button class="btn-sm" onclick="editProduct(${p.id})">Edit</button>
                <button class="btn-sm danger" onclick="deleteProduct(${p.id})">Delete</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function saveProduct() {
  const idField = document.getElementById('editProductId').value;
  const name = document.getElementById('pName').value.trim();
  const category = document.getElementById('pCategory').value;
  const price = parseInt(document.getElementById('pPrice').value) || 0;
  const badge = document.getElementById('pBadge').value.trim() || null;
  const sizes = document.getElementById('pSizes').value.split(',').map(s => s.trim()).filter(Boolean);
  const featured = document.getElementById('pFeatured').value === 'true';
  const description = document.getElementById('pDesc').value.trim();
  const image = document.getElementById('pImage').value.trim() || '';

  if (!name || !price) {
    alert('Name and price are required');
    return;
  }

  let list = getAdminProducts();

  if (idField) {
    // Edit
    const idx = list.findIndex(p => p.id === parseInt(idField));
    if (idx !== -1) {
      list[idx] = { ...list[idx], name, category, price, badge, sizes, featured, description, image };
    }
  } else {
    // Add
    const newId = list.length ? Math.max(...list.map(p => p.id)) + 1 : 1;
    list.push({ id: newId, name, category, price, badge, sizes, featured, description, image });
  }

  saveAdminProducts(list);
  resetProductForm();
  loadProducts();
  loadDashboard();
  alert('Product saved! Refresh the main website to see changes.');
}

function editProduct(id) {
  const p = getAdminProducts().find(x => x.id === id);
  if (!p) return;
  document.getElementById('editProductId').value = p.id;
  document.getElementById('pName').value = p.name;
  document.getElementById('pCategory').value = p.category;
  document.getElementById('pPrice').value = p.price;
  document.getElementById('pBadge').value = p.badge || '';
  document.getElementById('pSizes').value = (p.sizes || []).join(', ');
  document.getElementById('pFeatured').value = p.featured ? 'true' : 'false';
  document.getElementById('pDesc').value = p.description || '';
  document.getElementById('pImage').value = p.image || '';
  document.getElementById('productFormTitle').textContent = 'Edit Product';
  document.getElementById('cancelEditBtn').style.display = 'inline-block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  let list = getAdminProducts().filter(p => p.id !== id);
  saveAdminProducts(list);
  loadProducts();
  loadDashboard();
}

function resetProductForm() {
  document.getElementById('editProductId').value = '';
  document.getElementById('pName').value = '';
  document.getElementById('pPrice').value = '';
  document.getElementById('pBadge').value = '';
  document.getElementById('pSizes').value = '';
  document.getElementById('pDesc').value = '';
  document.getElementById('pImage').value = '';
  document.getElementById('pFeatured').value = 'false';
  document.getElementById('productFormTitle').textContent = 'Add New Product';
  document.getElementById('cancelEditBtn').style.display = 'none';
}

// ===== SETTINGS =====
function loadSettingsForm() {
  const s = getSettings();
  document.getElementById('sBusinessName').value = s.businessName || '';
  document.getElementById('sWhatsapp').value = s.whatsapp || '';
  document.getElementById('sUpi').value = s.upi || '';
  document.getElementById('sShipping').value = s.shipping || 99;
  document.getElementById('sPassword').value = s.password || DEFAULT_PASS;
  document.getElementById('sEmail').value = s.email || '';
}

function saveSettings() {
  const s = {
    businessName: document.getElementById('sBusinessName').value.trim() || 'HoodCulture',
    whatsapp: document.getElementById('sWhatsapp').value.trim(),
    upi: document.getElementById('sUpi').value.trim(),
    shipping: parseInt(document.getElementById('sShipping').value) || 99,
    password: document.getElementById('sPassword').value.trim() || DEFAULT_PASS,
    email: document.getElementById('sEmail').value.trim()
  };
  saveSettingsToStorage(s);
  alert('Settings saved!');
}

// ===== DATA EXPORT / IMPORT =====
function exportData() {
  const data = {
    products: getAdminProducts(),
    orders: getOrders(),
    settings: getSettings(),
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hoodculture-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.products) saveAdminProducts(data.products);
      if (data.orders) localStorage.setItem('hoodculture_orders', JSON.stringify(data.orders));
      if (data.settings) saveSettingsToStorage(data.settings);
      alert('Data imported successfully!');
      loadDashboard();
      loadOrders();
      loadProducts();
      loadSettingsForm();
    } catch (err) {
      alert('Invalid file');
    }
  };
  reader.readAsText(file);
}

function clearOrders() {
  if (!confirm('Delete ALL orders? This cannot be undone.')) return;
  localStorage.setItem('hoodculture_orders', '[]');
  loadOrders();
  loadDashboard();
}
