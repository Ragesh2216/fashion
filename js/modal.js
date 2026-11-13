/**
 * ÉLÉGANCE Atelier - Modals & Toast Manager
 * Handles Product Quick View Modal, Checkout Modal, Order Confirmation Popup,
 * and Toast notification system.
 */

class ModalManager {
  constructor() {
    this.activeProduct = null;
    this.selectedSize = 'M';
    this.selectedColor = 'Champagne';
    this.selectedQty = 1;
    this.initEventListeners();
  }

  initEventListeners() {
    // Close modals on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });

    // Close on backdrop click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.closeAllModals();
        }
      });
    });
  }

  closeAllModals() {
    document.querySelectorAll('.modal-container, .modal-overlay').forEach(el => {
      el.classList.remove('active');
    });
    document.body.classList.remove('modal-open');
  }

  /**
   * Open Product Quick View Modal
   */
  async openProductQuickView(productId) {
    const product = await window.boutiqueAPI.getProductById(productId);
    if (!product) {
      window.showToast('Product information could not be retrieved.', 'error');
      return;
    }

    this.activeProduct = product;
    this.selectedSize = 'M';
    this.selectedColor = 'Classic';
    this.selectedQty = 1;

    const modal = document.getElementById('productQuickViewModal');
    const modalBody = document.getElementById('quickViewModalBody');
    if (!modal || !modalBody) return;

    // Star rating generator
    const ratingNum = parseFloat(product.rating) || 4.5;
    const fullStars = Math.floor(ratingNum);
    const hasHalfStar = ratingNum - fullStars >= 0.5;
    let starsHtml = '';
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        starsHtml += '<span class="star filled">★</span>';
      } else if (i === fullStars && hasHalfStar) {
        starsHtml += '<span class="star half">★</span>';
      } else {
        starsHtml += '<span class="star empty">☆</span>';
      }
    }

    const isWishlisted = window.boutiqueWishlist ? window.boutiqueWishlist.has(product.id) : false;
    const imagesList = (product.images && product.images.length > 0) ? product.images : [product.thumbnail];

    modalBody.innerHTML = `
      <div class="quickview-grid">
        <!-- Gallery Column -->
        <div class="quickview-gallery">
          <div class="main-image-viewport">
            <img id="quickviewMainImg" src="${imagesList[0]}" alt="${product.title}" />
            ${product.discountPercentage > 0 ? `<span class="quickview-badge-discount">-${product.discountPercentage}% OFF</span>` : ''}
          </div>
          ${imagesList.length > 1 ? `
            <div class="thumbnails-track">
              ${imagesList.map((imgUrl, idx) => `
                <button type="button" class="thumb-btn ${idx === 0 ? 'active' : ''}" onclick="window.boutiqueModal.switchMainImage('${imgUrl}', this)">
                  <img src="${imgUrl}" alt="Thumbnail ${idx + 1}" />
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <!-- Details Column -->
        <div class="quickview-details">
          <div class="quickview-header-meta">
            <span class="quickview-brand">${product.brand}</span>
            <span class="quickview-sku">SKU: ${product.sku}</span>
          </div>

          <h2 class="quickview-title">${product.title}</h2>

          <div class="quickview-rating-row">
            <div class="stars-group">${starsHtml}</div>
            <span class="rating-number"><strong>${product.rating}</strong> / 5.0</span>
            <span class="rating-reviews-count">(${product.reviews ? product.reviews.length : 12} Verified Reviews)</span>
          </div>

          <div class="quickview-price-row">
            <span class="quickview-price">$${product.price.toFixed(2)}</span>
            ${product.discountPercentage > 0 ? `
              <span class="quickview-original-price">$${product.originalPrice.toFixed(2)}</span>
              <span class="quickview-save-tag">You save $${(product.originalPrice - product.price).toFixed(2)}</span>
            ` : ''}
          </div>

          <div class="quickview-stock-indicator ${product.stock < 5 ? 'urgent' : ''}">
            <span class="stock-dot"></span>
            <span>${product.stock < 5 ? `Only ${product.stock} pieces remaining — Order soon` : `In Stock & Ready to Dispatch (${product.stock} available)`}</span>
          </div>

          <p class="quickview-description">${product.description}</p>

          <!-- Size Selector (Apparel/Shoes) -->
          <div class="quickview-option-section">
            <div class="option-header">
              <span>Select Size:</span>
              <button type="button" class="btn-size-guide" onclick="window.showToast('Standard EU/US Couture sizing fits true to size.', 'info')">Size Guide</button>
            </div>
            <div class="size-options-group" id="sizeSelectorGroup">
              ${['XS', 'S', 'M', 'L', 'XL'].map((s, idx) => `
                <button type="button" class="size-pill ${s === 'M' ? 'selected' : ''}" onclick="window.boutiqueModal.selectSize('${s}', this)">${s}</button>
              `).join('')}
            </div>
          </div>

          <!-- Color Swatches -->
          <div class="quickview-option-section">
            <span class="option-title">Palette:</span>
            <div class="color-swatches-group">
              <button type="button" class="swatch-btn selected" style="background: #111;" title="Noir" onclick="window.boutiqueModal.selectColor('Noir', this)"></button>
              <button type="button" class="swatch-btn" style="background: #e8dcc4;" title="Champagne" onclick="window.boutiqueModal.selectColor('Champagne', this)"></button>
              <button type="button" class="swatch-btn" style="background: #6a1a24;" title="Burgundy" onclick="window.boutiqueModal.selectColor('Burgundy', this)"></button>
              <button type="button" class="swatch-btn" style="background: #2a3c2e;" title="Emerald" onclick="window.boutiqueModal.selectColor('Emerald', this)"></button>
            </div>
          </div>

          <!-- Quantity and Actions -->
          <div class="quickview-cta-row">
            <div class="quantity-controller modal-qty">
              <button type="button" class="qty-btn" onclick="window.boutiqueModal.adjustQty(-1)" aria-label="Decrease quantity">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <span id="quickviewQtyNum" class="qty-num">1</span>
              <button type="button" class="qty-btn" onclick="window.boutiqueModal.adjustQty(1)" aria-label="Increase quantity">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </div>

            <button type="button" class="btn-primary-luxury flex-1" onclick="window.boutiqueModal.addToCartFromModal()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              Add to Shopping Bag
            </button>

            <button type="button" class="btn-icon-wishlist-modal ${isWishlisted ? 'active' : ''}" onclick="window.boutiqueModal.toggleWishlistFromModal(this)" title="Save to Wishlist" aria-label="Save to Wishlist">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="${isWishlisted ? '#c5a880' : 'none'}" stroke="${isWishlisted ? '#c5a880' : 'currentColor'}" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
          </div>

          <!-- Product Assurance Accents -->
          <div class="quickview-assurances">
            <div class="assurance-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              <span>${product.shippingInformation}</span>
            </div>
            <div class="assurance-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>${product.warrantyInformation}</span>
            </div>
            <div class="assurance-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              <span>${product.returnPolicy}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('active');
    document.body.classList.add('modal-open');
  }

  switchMainImage(imgUrl, btnEl) {
    const mainImg = document.getElementById('quickviewMainImg');
    if (mainImg) {
      mainImg.src = imgUrl;
    }
    const container = btnEl.closest('.thumbnails-track');
    if (container) {
      container.querySelectorAll('.thumb-btn').forEach(b => b.classList.remove('active'));
      btnEl.classList.add('active');
    }
  }

  selectSize(size, btnEl) {
    this.selectedSize = size;
    const parent = btnEl.closest('.size-options-group');
    if (parent) {
      parent.querySelectorAll('.size-pill').forEach(b => b.classList.remove('selected'));
      btnEl.classList.add('selected');
    }
  }

  selectColor(color, btnEl) {
    this.selectedColor = color;
    const parent = btnEl.closest('.color-swatches-group');
    if (parent) {
      parent.querySelectorAll('.swatch-btn').forEach(b => b.classList.remove('selected'));
      btnEl.classList.add('selected');
    }
  }

  adjustQty(delta) {
    const next = this.selectedQty + delta;
    if (next >= 1 && next <= (this.activeProduct ? this.activeProduct.stock : 50)) {
      this.selectedQty = next;
      const el = document.getElementById('quickviewQtyNum');
      if (el) el.textContent = this.selectedQty;
    }
  }

  addToCartFromModal() {
    if (!this.activeProduct) return;
    window.boutiqueCart.addItem(this.activeProduct, this.selectedQty, {
      size: this.selectedSize,
      color: this.selectedColor
    });
    this.closeAllModals();
    if (window.showToast) {
      window.showToast(`Added ${this.selectedQty}x "${this.activeProduct.title}" (${this.selectedSize}) to bag.`, 'success');
    }
    // Automatically open the cart drawer to delight user
    const cartDrawer = document.getElementById('cartDrawer');
    if (cartDrawer) {
      cartDrawer.classList.add('active');
      document.body.classList.add('drawer-open');
    }
  }

  toggleWishlistFromModal(btn) {
    if (!this.activeProduct) return;
    const isAdded = window.boutiqueWishlist.toggle(this.activeProduct);
    btn.classList.toggle('active', isAdded);
    const svg = btn.querySelector('svg');
    if (svg) {
      if (isAdded) {
        svg.setAttribute('fill', '#c5a880');
        svg.setAttribute('stroke', '#c5a880');
      } else {
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
      }
    }
  }

  /**
   * Checkout Modal Handling
   */
  openCheckoutModal() {
    const summary = window.boutiqueCart.getSummary();
    if (summary.itemCount === 0) {
      window.showToast('Your shopping bag is empty.', 'error');
      return;
    }

    // Close cart drawer first
    const cartDrawer = document.getElementById('cartDrawer');
    if (cartDrawer) {
      cartDrawer.classList.remove('active');
      document.body.classList.remove('drawer-open');
    }

    const modal = document.getElementById('checkoutModal');
    const orderItemsContainer = document.getElementById('checkoutOrderItems');
    const checkoutSummaryContainer = document.getElementById('checkoutSummaryBox');

    if (!modal) return;

    if (orderItemsContainer) {
      orderItemsContainer.innerHTML = window.boutiqueCart.items.map(item => `
        <div class="checkout-mini-item">
          <img src="${item.thumbnail}" alt="${item.title}" />
          <div class="checkout-mini-info">
            <h5>${item.title}</h5>
            <span>Qty: ${item.quantity} | Size: ${item.size}</span>
          </div>
          <div class="checkout-mini-price">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
      `).join('');
    }

    if (checkoutSummaryContainer) {
      checkoutSummaryContainer.innerHTML = `
        <div class="breakdown-row"><span>Subtotal:</span><span>$${summary.subtotal.toFixed(2)}</span></div>
        ${summary.discountAmount > 0 ? `<div class="breakdown-row discount"><span>Discount:</span><span>-$${summary.discountAmount.toFixed(2)}</span></div>` : ''}
        <div class="breakdown-row"><span>Shipping:</span><span>${summary.shipping === 0 ? 'FREE' : `$${summary.shipping.toFixed(2)}`}</span></div>
        <div class="breakdown-row"><span>Tax (8%):</span><span>$${summary.tax.toFixed(2)}</span></div>
        <div class="breakdown-row total"><span>Total Amount:</span><span class="total-val">$${summary.total.toFixed(2)}</span></div>
      `;
    }

    modal.classList.add('active');
    document.body.classList.add('modal-open');
  }

  /**
   * Submit simulated checkout & show confirmation popup
   */
  processCheckout(event) {
    event.preventDefault();
    const form = event.target;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Complete Purchase';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="checkout-spinner"></span>
        Securing Order & Encrypting Payment...
      `;
    }

    const formData = new FormData(form);
    const orderData = {
      orderId: 'ELG-' + Math.floor(100000 + Math.random() * 900000),
      orderDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      customer: {
        fullName: formData.get('fullName') || 'Valued Client',
        email: formData.get('email') || 'client@elegance.com',
        phone: formData.get('phone') || '+1 (555) 019-2834',
        address: `${formData.get('address')}, ${formData.get('city')}, ${formData.get('postalCode')}`,
        country: formData.get('country') || 'United States'
      },
      paymentMethod: formData.get('paymentMethod') || 'Credit Card',
      items: [...window.boutiqueCart.items],
      summary: window.boutiqueCart.getSummary()
    };

    // Simulate luxury payment gateway roundtrip (1.2s)
    setTimeout(() => {
      // Store in LocalStorage orders history
      try {
        const existingOrders = JSON.parse(localStorage.getItem('elegance_orders') || '[]');
        existingOrders.unshift(orderData);
        localStorage.setItem('elegance_orders', JSON.stringify(existingOrders));
      } catch (e) {
        console.error('Failed to store order:', e);
      }

      // Clear the cart
      window.boutiqueCart.clearCart();

      // Reset button
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }

      // Close checkout modal
      const checkoutModal = document.getElementById('checkoutModal');
      if (checkoutModal) checkoutModal.classList.remove('active');

      // Open Order Confirmation Popup
      this.showOrderConfirmation(orderData);
    }, 1200);
  }

  showOrderConfirmation(order) {
    const modal = document.getElementById('orderConfirmationModal');
    const content = document.getElementById('orderConfirmationContent');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="confirmation-box">
        <div class="confirmation-icon-wrap">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c5a880" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>

        <span class="confirmation-sub">Order Confirmed & Payment Verified</span>
        <h3 class="confirmation-title">Thank You, ${order.customer.fullName}</h3>
        <p class="confirmation-desc">Your order <strong>#${order.orderId}</strong> has been received by our atelier and is currently being tailored and inspected for dispatch.</p>

        <div class="confirmation-meta-card">
          <div class="conf-meta-row">
            <span>Estimated Delivery:</span>
            <strong>${order.estimatedDelivery} (Express Courier)</strong>
          </div>
          <div class="conf-meta-row">
            <span>Delivery Destination:</span>
            <span>${order.customer.address}</span>
          </div>
          <div class="conf-meta-row">
            <span>Payment Method:</span>
            <span>${order.paymentMethod}</span>
          </div>
          <div class="conf-meta-row">
            <span>Total Paid:</span>
            <strong class="text-gold">$${order.summary.total.toFixed(2)}</strong>
          </div>
        </div>

        <div class="confirmation-items-preview">
          <h4>Items in this Shipment (${order.items.length})</h4>
          <div class="conf-items-list">
            ${order.items.map(it => `
              <div class="conf-item-row">
                <img src="${it.thumbnail}" alt="${it.title}" />
                <div class="conf-item-info">
                  <strong>${it.title}</strong>
                  <span>Size: ${it.size} | Qty: ${it.quantity}</span>
                </div>
                <span>$${(it.price * it.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="confirmation-actions">
          <button type="button" class="btn-primary-luxury" onclick="window.boutiqueModal.closeAllModals()">
            Continue Exploring Boutique
          </button>
        </div>
      </div>
    `;

    modal.classList.add('active');
    document.body.classList.add('modal-open');
  }
}

// Global Toast System
window.showToast = function(message, type = 'info') {
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast-pill toast-${type}`;

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
  } else if (type === 'error') {
    iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
  } else {
    iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
  }

  toast.innerHTML = `
    <span class="toast-icon">${iconSvg}</span>
    <span class="toast-text">${message}</span>
  `;

  toastContainer.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Remove after 3.5s
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3500);
};

// Global Modal Singleton
window.boutiqueModal = new ModalManager();
