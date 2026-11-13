/**
 * ÉLÉGANCE Atelier - Cart Service & State Manager
 * Handles cart item lifecycle, coupon discounts, calculations, LocalStorage persistence,
 * and cart drawer rendering.
 */

class CartManager {
  constructor() {
    this.STORAGE_KEY = 'elegance_cart';
    this.COUPON_KEY = 'elegance_coupon';
    this.SHIPPING_THRESHOLD = 150.00;
    this.STANDARD_SHIPPING = 15.00;
    this.TAX_RATE = 0.08; // 8% sales tax

    // Active coupon definitions
    this.VALID_COUPONS = {
      'ELEGANCE20': { type: 'percent', value: 20, desc: '20% Off Entire Order' },
      'SAVE10': { type: 'percent', value: 10, desc: '10% Off Entire Order' },
      'FREESHIP': { type: 'shipping', value: 100, desc: 'Complimentary Worldwide Shipping' },
      'WELCOME15': { type: 'percent', value: 15, desc: '15% Off First Order' }
    };

    this.items = this._loadCart();
    this.appliedCoupon = this._loadCoupon();
  }

  _loadCart() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load cart from LocalStorage:', e);
      return [];
    }
  }

  _saveCart() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items));
      this._notifyListeners();
    } catch (e) {
      console.error('Failed to save cart to LocalStorage:', e);
    }
  }

  _loadCoupon() {
    try {
      const data = localStorage.getItem(this.COUPON_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  _saveCoupon(coupon) {
    this.appliedCoupon = coupon;
    if (coupon) {
      localStorage.setItem(this.COUPON_KEY, JSON.stringify(coupon));
    } else {
      localStorage.removeItem(this.COUPON_KEY);
    }
    this._notifyListeners();
  }

  _notifyListeners() {
    this.updateHeaderBadge();
    this.renderCartDrawer();
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: this.getSummary() }));
  }

  /**
   * Add item to cart with selected size/color options
   */
  addItem(product, quantity = 1, options = {}) {
    const selectedSize = options.size || 'M';
    const selectedColor = options.color || 'Default';
    const cartItemId = `${product.id}-${selectedSize}-${selectedColor}`;

    const existingIndex = this.items.findIndex(item => item.cartItemId === cartItemId);

    if (existingIndex > -1) {
      const currentQty = this.items[existingIndex].quantity;
      const maxStock = product.stock || 50;
      this.items[existingIndex].quantity = Math.min(currentQty + quantity, maxStock);
    } else {
      this.items.push({
        cartItemId,
        productId: product.id,
        title: product.title,
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        thumbnail: product.thumbnail || (product.images && product.images[0]),
        category: product.category,
        brand: product.brand,
        size: selectedSize,
        color: selectedColor,
        quantity: Math.max(1, quantity),
        stock: product.stock || 50
      });
    }

    this._saveCart();
  }

  /**
   * Remove item from cart
   */
  removeItem(cartItemId) {
    this.items = this.items.filter(item => item.cartItemId !== cartItemId);
    this._saveCart();
  }

  /**
   * Update quantity of an item
   */
  updateQuantity(cartItemId, newQty) {
    const item = this.items.find(i => i.cartItemId === cartItemId);
    if (!item) return;

    if (newQty <= 0) {
      this.removeItem(cartItemId);
    } else {
      item.quantity = Math.min(newQty, item.stock || 50);
      this._saveCart();
    }
  }

  /**
   * Clear entire cart
   */
  clearCart() {
    this.items = [];
    this.appliedCoupon = null;
    localStorage.removeItem(this.COUPON_KEY);
    this._saveCart();
  }

  /**
   * Apply coupon code
   */
  applyCoupon(code) {
    if (!code) return { success: false, message: 'Please enter a voucher code.' };

    const normalizedCode = code.trim().toUpperCase();
    const coupon = this.VALID_COUPONS[normalizedCode];

    if (!coupon) {
      return { success: false, message: 'Invalid or expired promotional code.' };
    }

    this._saveCoupon({
      code: normalizedCode,
      ...coupon
    });

    return {
      success: true,
      message: `Code "${normalizedCode}" applied! ${coupon.desc}`,
      coupon: this.appliedCoupon
    };
  }

  /**
   * Remove currently applied coupon
   */
  removeCoupon() {
    this._saveCoupon(null);
    return { success: true, message: 'Promotional code removed.' };
  }

  /**
   * Total item count
   */
  getItemCount() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Calculate financial summary
   */
  getSummary() {
    const subtotal = this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    let discountAmount = 0;
    let shipping = subtotal >= this.SHIPPING_THRESHOLD || subtotal === 0 ? 0 : this.STANDARD_SHIPPING;

    if (this.appliedCoupon) {
      if (this.appliedCoupon.type === 'percent') {
        discountAmount = (subtotal * this.appliedCoupon.value) / 100;
      } else if (this.appliedCoupon.type === 'shipping') {
        shipping = 0;
      }
    }

    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const tax = taxableAmount > 0 ? taxableAmount * this.TAX_RATE : 0;
    const total = taxableAmount + shipping + tax;

    return {
      itemCount: this.getItemCount(),
      subtotal: parseFloat(subtotal.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      shipping: parseFloat(shipping.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      appliedCoupon: this.appliedCoupon,
      freeShippingQualified: subtotal >= this.SHIPPING_THRESHOLD,
      freeShippingThreshold: this.SHIPPING_THRESHOLD,
      freeShippingRemaining: Math.max(0, this.SHIPPING_THRESHOLD - subtotal)
    };
  }

  /**
   * Update header badges
   */
  updateHeaderBadge() {
    const badges = document.querySelectorAll('.cart-count-badge');
    const count = this.getItemCount();
    badges.forEach(badge => {
      badge.textContent = count;
      badge.classList.toggle('has-items', count > 0);
      badge.style.display = count > 0 ? 'flex' : 'none';
    });

    const subtotalDisplays = document.querySelectorAll('.header-cart-subtotal');
    const summary = this.getSummary();
    subtotalDisplays.forEach(el => {
      el.textContent = `$${summary.subtotal.toFixed(2)}`;
    });
  }

  /**
   * Render cart drawer contents
   */
  renderCartDrawer() {
    const container = document.getElementById('cartDrawerItems');
    const summaryContainer = document.getElementById('cartDrawerSummary');
    const emptyState = document.getElementById('cartDrawerEmpty');
    const footerContainer = document.getElementById('cartDrawerFooter');

    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'flex';
      if (summaryContainer) summaryContainer.style.display = 'none';
      if (footerContainer) footerContainer.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (summaryContainer) summaryContainer.style.display = 'block';
    if (footerContainer) footerContainer.style.display = 'block';

    // Render items list
    container.innerHTML = this.items.map(item => `
      <div class="cart-item" data-cart-id="${item.cartItemId}">
        <div class="cart-item-img-wrap">
          <img src="${item.thumbnail}" alt="${item.title}" loading="lazy" />
        </div>
        <div class="cart-item-info">
          <div class="cart-item-header">
            <span class="cart-item-brand">${item.brand || 'Boutique'}</span>
            <button class="cart-item-remove-btn" onclick="window.boutiqueCart.removeItem('${item.cartItemId}')" title="Remove item" aria-label="Remove item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <h4 class="cart-item-title">${item.title}</h4>
          <div class="cart-item-meta">
            <span class="item-meta-pill">Size: ${item.size}</span>
            ${item.color !== 'Default' ? `<span class="item-meta-pill">Color: ${item.color}</span>` : ''}
          </div>
          <div class="cart-item-pricing-row">
            <div class="cart-item-price">
              $${(item.price * item.quantity).toFixed(2)}
              ${item.quantity > 1 ? `<span class="cart-unit-price">($${item.price.toFixed(2)} ea)</span>` : ''}
            </div>
            <div class="quantity-controller">
              <button class="qty-btn minus" onclick="window.boutiqueCart.updateQuantity('${item.cartItemId}', ${item.quantity - 1})" aria-label="Decrease quantity">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <span class="qty-num">${item.quantity}</span>
              <button class="qty-btn plus" onclick="window.boutiqueCart.updateQuantity('${item.cartItemId}', ${item.quantity + 1})" aria-label="Increase quantity">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    // Render summary & shipping meter
    const summary = this.getSummary();
    const progressPercent = Math.min(100, (summary.subtotal / summary.freeShippingThreshold) * 100);

    if (summaryContainer) {
      summaryContainer.innerHTML = `
        <!-- Free Shipping Meter -->
        <div class="shipping-meter-wrap">
          <div class="shipping-meter-text">
            ${summary.freeShippingQualified
              ? `<span class="text-gold">✦ Congratulations! You have qualified for <strong>Free Worldwide Shipping</strong>.</span>`
              : `Add <strong>$${summary.freeShippingRemaining.toFixed(2)}</strong> more to unlock <strong>Complimentary Worldwide Shipping</strong>.`
            }
          </div>
          <div class="shipping-meter-bar">
            <div class="shipping-meter-progress" style="width: ${progressPercent}%;"></div>
          </div>
        </div>

        <!-- Coupon Input Box -->
        <div class="coupon-box">
          <div class="coupon-input-group">
            <input type="text" id="couponCodeInput" placeholder="Voucher / Promo Code (e.g. ELEGANCE20)" value="${this.appliedCoupon ? this.appliedCoupon.code : ''}" />
            ${this.appliedCoupon
              ? `<button type="button" class="btn-coupon remove" onclick="window.boutiqueCart.handleRemoveCoupon()">Remove</button>`
              : `<button type="button" class="btn-coupon apply" onclick="window.boutiqueCart.handleApplyCoupon()">Apply</button>`
            }
          </div>
          ${this.appliedCoupon ? `<p class="coupon-applied-note">✓ Applied: ${this.appliedCoupon.desc}</p>` : ''}
          <div class="quick-promos-hint">
            <span>Available codes:</span>
            <button type="button" class="promo-pill" onclick="window.boutiqueCart.quickApply('ELEGANCE20')">ELEGANCE20 (20% OFF)</button>
            <button type="button" class="promo-pill" onclick="window.boutiqueCart.quickApply('FREESHIP')">FREESHIP</button>
          </div>
        </div>

        <!-- Order Breakdown -->
        <div class="cart-breakdown">
          <div class="breakdown-row">
            <span>Subtotal</span>
            <span>$${summary.subtotal.toFixed(2)}</span>
          </div>
          ${summary.discountAmount > 0 ? `
            <div class="breakdown-row discount">
              <span>Promotional Discount (${this.appliedCoupon.code})</span>
              <span>-$${summary.discountAmount.toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="breakdown-row">
            <span>Estimated Shipping</span>
            <span>${summary.shipping === 0 ? '<strong class="text-gold">COMPLIMENTARY</strong>' : `$${summary.shipping.toFixed(2)}`}</span>
          </div>
          <div class="breakdown-row">
            <span>Estimated Sales Tax (8%)</span>
            <span>$${summary.tax.toFixed(2)}</span>
          </div>
          <div class="breakdown-row total">
            <span>Estimated Total</span>
            <span class="total-val">$${summary.total.toFixed(2)}</span>
          </div>
        </div>
      `;
    }
  }

  handleApplyCoupon() {
    const input = document.getElementById('couponCodeInput');
    if (!input) return;
    const res = this.applyCoupon(input.value);
    if (window.showToast) {
      window.showToast(res.message, res.success ? 'success' : 'error');
    }
  }

  handleRemoveCoupon() {
    const res = this.removeCoupon();
    if (window.showToast) {
      window.showToast(res.message, 'info');
    }
  }

  quickApply(code) {
    const res = this.applyCoupon(code);
    if (window.showToast) {
      window.showToast(res.message, res.success ? 'success' : 'error');
    }
  }
}

// Global Cart Singleton
window.boutiqueCart = new CartManager();
