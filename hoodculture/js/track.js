// ===== ORDER TRACKING =====

document.addEventListener('DOMContentLoaded', () => {
  const trackBtn = document.getElementById('trackBtn');
  const orderIdInput = document.getElementById('orderIdInput');

  if (trackBtn) {
    trackBtn.addEventListener('click', trackOrder);
  }

  if (orderIdInput) {
    orderIdInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') trackOrder();
    });
  }

  // Auto-track if order ID in URL
  const params = new URLSearchParams(window.location.search);
  const oid = params.get('id');
  if (oid) {
    orderIdInput.value = oid;
    trackOrder();
  }
});

function trackOrder() {
  const orderId = document.getElementById('orderIdInput').value.trim().toUpperCase();
  const resultBox = document.getElementById('trackResult');
  const notFound = document.getElementById('trackNotFound');

  resultBox.style.display = 'none';
  notFound.style.display = 'none';

  if (!orderId) {
    alert('Please enter an Order ID');
    return;
  }

  const orders = JSON.parse(localStorage.getItem('hoodculture_orders')) || [];
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    notFound.style.display = 'block';
    return;
  }

  // Show result
  resultBox.style.display = 'block';
  document.getElementById('resultOrderId').textContent = order.id;
  document.getElementById('resultDate').textContent = `Placed on ${order.date}`;

  // Status badge
  const statusEl = document.getElementById('resultStatus');
  const statusMap = {
    placed: { text: 'Order Placed', class: 'status-placed' },
    confirmed: { text: 'Confirmed', class: 'status-confirmed' },
    shipped: { text: 'Shipped', class: 'status-shipped' },
    out_for_delivery: { text: 'Out for Delivery', class: 'status-ofd' },
    delivered: { text: 'Delivered', class: 'status-delivered' }
  };

  // Simulate progress based on time (for demo)
  // In real app this comes from backend
  const status = order.status || 'confirmed';
  const statusInfo = statusMap[status] || statusMap.confirmed;
  statusEl.textContent = statusInfo.text;
  statusEl.className = 'status-badge ' + statusInfo.class;

  // Update steps
  const statusOrder = ['placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered'];
  let currentIndex = statusOrder.indexOf(status);
  if (currentIndex === -1) currentIndex = 1; // default confirmed

  for (let i = 1; i <= 5; i++) {
    const step = document.getElementById('step' + i);
    step.classList.remove('active', 'completed');
    if (i - 1 < currentIndex) {
      step.classList.add('completed');
    } else if (i - 1 === currentIndex) {
      step.classList.add('active');
    }
  }

  // Items
  const itemsContainer = document.getElementById('trackItems');
  itemsContainer.innerHTML = `
    <h4>Items</h4>
    ${order.items.map(item => `
      <div class="track-item-row">
        <span>${item.name} (Size: ${item.size || '—'}) × ${item.qty}</span>
        <span>₹${(item.price * item.qty).toLocaleString()}</span>
      </div>
    `).join('')}
    <div class="track-item-row total">
      <span>Total (incl. shipping)</span>
      <span>₹${order.total.toLocaleString()}</span>
    </div>
  `;

  // Address
  const s = order.shipping;
  document.getElementById('trackAddress').innerHTML = `
    ${s.name}<br>
    ${s.address}<br>
    ${s.city}, ${s.state} - ${s.pincode}<br>
    Phone: ${s.phone}
  `;
}
