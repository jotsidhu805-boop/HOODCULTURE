// ===== CHECKOUT PAGE LOGIC =====

document.addEventListener('DOMContentLoaded', () => {
  renderCheckoutItems();
  setupPaymentToggle();
  setupPlaceOrder();
});

function renderCheckoutItems() {
  const container = document.getElementById('checkoutItems');
  const subtotalEl = document.getElementById('summarySubtotal');
  const totalEl = document.getElementById('summaryTotal');
  const shippingEl = document.getElementById('summaryShipping');

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '<p class="empty-cart">Your cart is empty. <a href="shop.html">Go shopping</a></p>';
    if (subtotalEl) subtotalEl.textContent = '₹0';
    if (totalEl) totalEl.textContent = '₹0';
    if (shippingEl) shippingEl.textContent = '₹0';
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="checkout-item">
      <div class="checkout-item-img">HC</div>
      <div class="checkout-item-info">
        <strong>${item.name}</strong>
        <p>Size: ${item.size || '—'} | Qty: ${item.qty} × ₹${item.price.toLocaleString()}</p>
      </div>
      <div class="checkout-item-price">₹${(item.price * item.qty).toLocaleString()}</div>
    </div>
  `).join('');

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const settings = JSON.parse(localStorage.getItem('hoodculture_settings') || '{}');
  const shippingCost = settings.shipping != null ? settings.shipping : 99;
  const shipping = subtotal > 0 ? shippingCost : 0;
  const total = subtotal + shipping;

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString()}`;
  if (shippingEl) shippingEl.textContent = `₹${shipping}`;
  if (totalEl) totalEl.textContent = `₹${total.toLocaleString()}`;
}

function setupPaymentToggle() {
  const radios = document.querySelectorAll('input[name="payment"]');
  const upiDetails = document.getElementById('upiDetails');
  const cardDetails = document.getElementById('cardDetails');
  const netbankingDetails = document.getElementById('netbankingDetails');

  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      upiDetails.style.display = 'none';
      cardDetails.style.display = 'none';
      netbankingDetails.style.display = 'none';

      if (radio.value === 'upi') upiDetails.style.display = 'block';
      if (radio.value === 'card') cardDetails.style.display = 'block';
      if (radio.value === 'netbanking') netbankingDetails.style.display = 'block';
    });
  });

  // Card number formatting
  const cardNumber = document.getElementById('cardNumber');
  if (cardNumber) {
    cardNumber.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      value = value.replace(/(.{4})/g, '$1 ').trim();
      e.target.value = value;
    });
  }

  // Expiry formatting
  const cardExpiry = document.getElementById('cardExpiry');
  if (cardExpiry) {
    cardExpiry.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
      }
      e.target.value = value;
    });
  }
}

function setupPlaceOrder() {
  const btn = document.getElementById('placeOrderBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    // Validate shipping
    const name = document.getElementById('shipName').value.trim();
    const phone = document.getElementById('shipPhone').value.trim();
    const email = document.getElementById('shipEmail').value.trim();
    const address = document.getElementById('shipAddress').value.trim();
    const city = document.getElementById('shipCity').value.trim();
    const pincode = document.getElementById('shipPincode').value.trim();
    const state = document.getElementById('shipState').value;

    if (!name || !phone || !email || !address || !city || !pincode || !state) {
      alert('Please fill in all shipping details.');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    // Basic payment validation
    if (paymentMethod === 'upi') {
      const upi = document.getElementById('upiId').value.trim();
      if (!upi || !upi.includes('@')) {
        alert('Please enter a valid UPI ID (e.g. name@upi)');
        return;
      }
    }

    if (paymentMethod === 'card') {
      const cardNum = document.getElementById('cardNumber').value.replace(/\s/g, '');
      const expiry = document.getElementById('cardExpiry').value;
      const cvv = document.getElementById('cardCvv').value;
      const cardName = document.getElementById('cardName').value.trim();
      if (cardNum.length < 15 || !expiry || cvv.length < 3 || !cardName) {
        alert('Please fill in all card details correctly.');
        return;
      }
    }

    if (paymentMethod === 'netbanking') {
      const bank = document.getElementById('bankSelect').value;
      if (!bank) {
        alert('Please select your bank.');
        return;
      }
    }

    // Generate Order ID
    const orderId = 'HC-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create order object
    const order = {
      id: orderId,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: 'confirmed', // starts as confirmed
      payment: paymentMethod,
      items: [...cart],
      shipping: {
        name,
        phone,
        email,
        address,
        city,
        pincode,
        state
      },
      total: cart.reduce((sum, item) => sum + (item.price * item.qty), 0) + (JSON.parse(localStorage.getItem('hoodculture_settings') || '{}').shipping || 99)
    };

    // Save order to localStorage
    let orders = JSON.parse(localStorage.getItem('hoodculture_orders')) || [];
    orders.push(order);
    localStorage.setItem('hoodculture_orders', JSON.stringify(orders));

    // Clear cart
    cart = [];
    saveCart();
    updateCartUI();

    // Show success modal
    document.getElementById('generatedOrderId').textContent = orderId;
    document.getElementById('successModal').classList.add('active');
  });
}

// Show UPI from admin settings
document.addEventListener('DOMContentLoaded', () => {
  const settings = JSON.parse(localStorage.getItem('hoodculture_settings') || '{}');
  const upiInput = document.getElementById('upiId');
  if (upiInput && settings.upi) {
    // Add a note above UPI field
    const note = document.createElement('p');
    note.style.cssText = 'font-size:13px;color:#39ff14;margin-bottom:12px;';
    note.innerHTML = 'Pay to UPI: <strong>' + settings.upi + '</strong>';
    const upiDetails = document.getElementById('upiDetails');
    if (upiDetails) upiDetails.insertBefore(note, upiDetails.firstChild);
  }
  // Update shipping display
  const shipEl = document.getElementById('summaryShipping');
  if (shipEl && settings.shipping != null) {
    // Will be recalculated in renderCheckoutItems
  }
});
