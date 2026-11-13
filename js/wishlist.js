/**
 * ÉLÉGANCE Atelier - Wishlist Service & State Manager
 * Handles saved luxury pieces, LocalStorage persistence, drawer rendering,
 * and quick add to cart from wishlist.
 */

class WishlistManager {
  constructor() {
    this.STORAGE_KEY = 'elegance_wishlist';
    this.items = this._loadWishlist();
  }

  _loadWishlist() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load wishlist from LocalStorage:', e);
      return [];
    }
  }

  _saveWishlist() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items));
      this._notifyListeners();
    } catch (e) {
      console.error('Failed to save wishlist to LocalStorage:', e);
    }
  }

  _notifyListeners() {
    this.updateHeaderBadge();
    this.updateHeartIcons();
    this.renderWishlistDrawer();
    window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: { count: this.items.length } }));
  }

  /**
   * Check if product is in wishlist
   */
  has(productId) {
    const numId = parseInt(productId, 10);
    return this.items.some(item => item.id === numId);
  }

  /**
   * Toggle item in/out of wishlist
   */
  toggle(product) {
    const numId = parseInt(product.id, 10);
    const index = this.items.findIndex(item => item.id === numId);

    if (index > -1) {
      // Remove
      this.items.splice(index, 1);
      this._saveWishlist();
      if (window.showToast) {
        window.showToast(`Removed "${product.title}" from your Wishlist`, 'info');
      }
      return false; // Not in wishlist now
    } else {
      // Add
      this.items.push({
        id: product.id,
        title: product.title,
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        thumbnail: product.thumbnail || (product.images && product.images[0]),
        category: product.category,
        brand: product.brand,
        rating: product.rating,
        stock: product.stock
      });
      this._saveWishlist();
      if (window.showToast) {
        window.showToast(`Added "${product.title}" to your Wishlist`, 'success');
      }
      return true; // Added to wishlist
    }
  }

  /**
   * Remove by product ID
   */
  remove(productId) {
    const numId = parseInt(productId, 10);
    this.items = this.items.filter(item => item.id !== numId);
    this._saveWishlist();
  }

  /**
   * Move item directly from Wishlist to Cart
   */
  moveToCart(productId) {
    const numId = parseInt(productId, 10);
    const item = this.items.find(i => i.id === numId);
    if (!item) return;

    if (window.boutiqueCart) {
      window.boutiqueCart.addItem(item, 1, { size: 'M', color: 'Default' });
      this.remove(numId);
      if (window.showToast) {
        window.showToast(`Moved "${item.title}" to Shopping Bag`, 'success');
      }
    }
  }

  /**
   * Update header badges
   */
  updateHeaderBadge() {
    const badges = document.querySelectorAll('.wishlist-count-badge');
    const count = this.items.length;
    badges.forEach(badge => {
      badge.textContent = count;
      badge.classList.toggle('has-items', count > 0);
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  /**
   * Update all heart buttons on page to match current state
   */
  updateHeartIcons() {
    const heartBtns = document.querySelectorAll('[data-wishlist-id]');
    heartBtns.forEach(btn => {
      const pid = parseInt(btn.getAttribute('data-wishlist-id'), 10);
      const isSaved = this.has(pid);
      btn.classList.toggle('active', isSaved);
      btn.setAttribute('aria-pressed', isSaved ? 'true' : 'false');
      btn.setAttribute('title', isSaved ? 'Remove from Wishlist' : 'Add to Wishlist');
      
      const svg = btn.querySelector('svg');
      if (svg) {
        if (isSaved) {
          svg.setAttribute('fill', '#c5a880');
          svg.setAttribute('stroke', '#c5a880');
        } else {
          svg.setAttribute('fill', 'none');
          svg.setAttribute('stroke', 'currentColor');
        }
      }
    });
  }

  /**
   * Render Wishlist Drawer
   */
  renderWishlistDrawer() {
    const container = document.getElementById('wishlistDrawerItems');
    const emptyState = document.getElementById('wishlistDrawerEmpty');

    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'flex';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    container.innerHTML = this.items.map(item => `
      <div class="wishlist-item" data-id="${item.id}">
        <div class="wishlist-item-img-wrap">
          <img src="${item.thumbnail}" alt="${item.title}" loading="lazy" />
        </div>
        <div class="wishlist-item-info">
          <div class="wishlist-item-header">
            <span class="wishlist-item-brand">${item.brand || 'Boutique'}</span>
            <button class="wishlist-item-remove-btn" onclick="window.boutiqueWishlist.remove(${item.id})" title="Remove from wishlist" aria-label="Remove from wishlist">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <h4 class="wishlist-item-title">${item.title}</h4>
          <div class="wishlist-item-price">$${item.price.toFixed(2)}</div>
          <div class="wishlist-item-actions">
            <button class="btn-wishlist-cart" onclick="window.boutiqueWishlist.moveToCart(${item.id})">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              Move to Bag
            </button>
            <button class="btn-wishlist-view" onclick="window.boutiqueModal.openProductQuickView(${item.id})">
              Quick View
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }
}

// Global Wishlist Singleton
window.boutiqueWishlist = new WishlistManager();
