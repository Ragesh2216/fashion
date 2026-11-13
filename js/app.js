/**
 * ÉLÉGANCE Atelier - Main Application Controller
 * Coordinates API fetching, dynamic rendering, catalog filtering, sorting,
 * search debounce, section tabs, countdown timer, newsletter, and mobile navigation.
 */

class BoutiqueApp {
  constructor() {
    this.allProducts = [];
    this.filteredProducts = [];
    this.currentCategory = 'all';
    this.currentSort = 'featured';
    this.searchQuery = '';
    this.currentPage = 1;
    this.pageSize = 8;
    this.isLoading = true;

    this.init();
  }

  async init() {
    this.initHeaderScroll();
    this.initMobileNav();
    this.initDrawers();
    this.initCountdownTimer();
    this.initNewsletter();
    this.initSearchAndFilters();
    this.initAOS();

    // Initial state setup for cart & wishlist badges
    if (window.boutiqueCart) {
      window.boutiqueCart.updateHeaderBadge();
      window.boutiqueCart.renderCartDrawer();
    }
    if (window.boutiqueWishlist) {
      window.boutiqueWishlist.updateHeaderBadge();
      window.boutiqueWishlist.renderWishlistDrawer();
    }

    // Load API products
    await this.loadInitialProducts();
  }

  /**
   * Header scroll glassmorphism effect
   */
  initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  /**
   * Mobile navigation drawer toggle
   */
  initMobileNav() {
    const menuToggle = document.getElementById('mobileMenuToggle');
    const mobileNav = document.getElementById('mobileNavDrawer');
    const overlay = document.getElementById('mobileNavOverlay');
    const closeBtn = document.getElementById('mobileNavClose');

    const toggleNav = (open) => {
      if (!mobileNav || !overlay) return;
      if (open) {
        mobileNav.classList.add('active');
        overlay.classList.add('active');
        document.body.classList.add('drawer-open');
      } else {
        mobileNav.classList.remove('active');
        overlay.classList.remove('active');
        document.body.classList.remove('drawer-open');
      }
    };

    if (menuToggle) menuToggle.addEventListener('click', () => toggleNav(true));
    if (closeBtn) closeBtn.addEventListener('click', () => toggleNav(false));
    if (overlay) overlay.addEventListener('click', () => toggleNav(false));

    // Close when clicking any nav link
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => toggleNav(false));
    });
  }

  /**
   * Cart & Wishlist Drawers setup
   */
  initDrawers() {
    // Cart Drawer
    const cartDrawer = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartDrawerOverlay');
    const cartTriggers = document.querySelectorAll('.cart-drawer-trigger');
    const cartCloseBtn = document.getElementById('cartDrawerClose');

    const openCart = () => {
      if (cartDrawer && cartOverlay) {
        cartDrawer.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.classList.add('drawer-open');
        window.boutiqueCart.renderCartDrawer();
      }
    };

    const closeCart = () => {
      if (cartDrawer && cartOverlay) {
        cartDrawer.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.classList.remove('drawer-open');
      }
    };

    cartTriggers.forEach(t => t.addEventListener('click', openCart));
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    // Wishlist Drawer
    const wishlistDrawer = document.getElementById('wishlistDrawer');
    const wishlistOverlay = document.getElementById('wishlistDrawerOverlay');
    const wishlistTriggers = document.querySelectorAll('.wishlist-drawer-trigger');
    const wishlistCloseBtn = document.getElementById('wishlistDrawerClose');

    const openWishlist = () => {
      if (wishlistDrawer && wishlistOverlay) {
        wishlistDrawer.classList.add('active');
        wishlistOverlay.classList.add('active');
        document.body.classList.add('drawer-open');
        window.boutiqueWishlist.renderWishlistDrawer();
      }
    };

    const closeWishlist = () => {
      if (wishlistDrawer && wishlistOverlay) {
        wishlistDrawer.classList.remove('active');
        wishlistOverlay.classList.remove('active');
        document.body.classList.remove('drawer-open');
      }
    };

    wishlistTriggers.forEach(t => t.addEventListener('click', openWishlist));
    if (wishlistCloseBtn) wishlistCloseBtn.addEventListener('click', closeWishlist);
    if (wishlistOverlay) wishlistOverlay.addEventListener('click', closeWishlist);

    // Expose close helpers globally
    window.closeCartDrawer = closeCart;
    window.closeWishlistDrawer = closeWishlist;
  }

  /**
   * Fetch products from DummyJSON Products API
   */
  async loadInitialProducts() {
    this.setLoadingState(true);
    const errorBanner = document.getElementById('catalogErrorBanner');
    if (errorBanner) errorBanner.style.display = 'none';

    try {
      this.allProducts = await window.boutiqueAPI.getAllFashionProducts();
      this.filteredProducts = [...this.allProducts];
      this.setLoadingState(false);

      // Render featured curated sections
      this.renderCuratedSections();

      // Render main interactive catalog
      this.applyFiltersAndSort();
    } catch (err) {
      console.error('Failed to load boutique catalog:', err);
      this.setLoadingState(false);
      if (errorBanner) {
        errorBanner.style.display = 'block';
        const msgEl = errorBanner.querySelector('.error-message-text');
        if (msgEl) msgEl.textContent = 'Could not establish connection to the product service. Please click retry.';
      }
    }
  }

  /**
   * Loading skeletons toggle
   */
  setLoadingState(loading) {
    this.isLoading = loading;
    const skeleton = document.getElementById('catalogSkeleton');
    const grid = document.getElementById('catalogProductGrid');

    if (skeleton) skeleton.style.display = loading ? 'grid' : 'none';
    if (grid) grid.style.display = loading ? 'none' : 'grid';
  }

  /**
   * Render Curated Homepage Sections:
   * - New Arrivals
   * - Trending Products
   * - Best Sellers
   */
  renderCuratedSections() {
    if (this.allProducts.length === 0) return;

    // 1. New Arrivals: Recent/stylish pieces
    const newArrivals = this.allProducts.slice(0, 4);
    this.renderProductCards(newArrivals, 'newArrivalsGrid', { badgeText: 'NEW DROP', badgeType: 'new' });

    // 2. Trending Products: High discount / popular
    const trending = [...this.allProducts]
      .sort((a, b) => b.discountPercentage - a.discountPercentage)
      .slice(0, 4);
    this.renderProductCards(trending, 'trendingGrid', { badgeText: 'HOT TREND', badgeType: 'trending' });

    // 3. Best Sellers: Top rating
    const bestSellers = [...this.allProducts]
      .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
      .slice(0, 4);
    this.renderProductCards(bestSellers, 'bestSellersGrid', { badgeText: 'BEST SELLER', badgeType: 'bestseller' });
  }

  /**
   * Render a grid of product cards
   */
  renderProductCards(products, containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (products.length === 0) {
      container.innerHTML = `
        <div class="empty-results-box">
          <p>No fashion pieces found matching your criteria.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = products.map(product => {
      const isSaved = window.boutiqueWishlist ? window.boutiqueWishlist.has(product.id) : false;
      const discount = product.discountPercentage || 0;
      const originalPrice = product.originalPrice || product.price;

      // Rating stars
      const ratingNum = parseFloat(product.rating) || 4.5;
      const fullStars = Math.floor(ratingNum);

      let badgeHtml = '';
      if (options.badgeText) {
        badgeHtml = `<span class="card-badge badge-${options.badgeType || 'default'}">${options.badgeText}</span>`;
      } else if (discount > 10) {
        badgeHtml = `<span class="card-badge badge-sale">-${discount}% OFF</span>`;
      }

      return `
        <article class="product-card" data-product-id="${product.id}" data-aos="fade-up">
          <div class="product-card-media">
            <img src="${product.thumbnail}" alt="${product.title}" loading="lazy" />
            ${badgeHtml}

            <!-- Floating Wishlist Button -->
            <button type="button" class="card-wishlist-btn ${isSaved ? 'active' : ''}" 
              data-wishlist-id="${product.id}"
              onclick="window.boutiqueApp.handleCardWishlistToggle(${product.id}, this)"
              title="${isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}"
              aria-label="Wishlist">
              <svg width="18" height="18" viewBox="0 0 24 24" 
                fill="${isSaved ? '#c5a880' : 'none'}" 
                stroke="${isSaved ? '#c5a880' : 'currentColor'}" 
                stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>

            <!-- Card Quick Action Hover Drawer -->
            <div class="card-quick-actions">
              <button type="button" class="btn-card-action quick-view" onclick="window.boutiqueModal.openProductQuickView(${product.id})">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                Quick View
              </button>
              <button type="button" class="btn-card-action add-bag" onclick="window.boutiqueApp.quickAddToCart(${product.id})">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                Add to Bag
              </button>
            </div>
          </div>

          <div class="product-card-body">
            <div class="card-brand-category">
              <span class="card-brand">${product.brand || 'Boutique'}</span>
              <span class="card-category">${product.category.replace('-', ' ')}</span>
            </div>

            <h3 class="product-title" onclick="window.boutiqueModal.openProductQuickView(${product.id})">
              ${product.title}
            </h3>

            <div class="card-rating-line">
              <div class="stars-gold">${'★'.repeat(fullStars)}${'☆'.repeat(5 - fullStars)}</div>
              <span class="rating-text">${product.rating}</span>
            </div>

            <div class="card-pricing">
              <span class="current-price">$${product.price.toFixed(2)}</span>
              ${discount > 0 ? `<span class="original-price">$${originalPrice.toFixed(2)}</span>` : ''}
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Re-sync wishlist icons
    if (window.boutiqueWishlist) {
      window.boutiqueWishlist.updateHeartIcons();
    }
  }

  /**
   * Search and Filters setup
   */
  initSearchAndFilters() {
    // Search input with debounce
    const searchInput = document.getElementById('catalogSearchInput');
    const headerSearchInput = document.getElementById('headerSearchInput');
    let debounceTimer;

    const handleSearch = (val) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.searchQuery = val.trim();
        this.currentPage = 1;
        this.applyFiltersAndSort();

        // Scroll to catalog section if searching from header
        const catalogSec = document.getElementById('shopCatalog');
        if (catalogSec && val.trim().length > 0) {
          catalogSec.scrollIntoView({ behavior: 'smooth' });
        }
      }, 250);
    };

    if (searchInput) {
      searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
    }
    if (headerSearchInput) {
      headerSearchInput.addEventListener('input', (e) => handleSearch(e.target.value));
    }

    // Category filter pills
    document.querySelectorAll('.cat-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cat = e.currentTarget.getAttribute('data-category');
        this.setCategory(cat);
      });
    });

    // Category cards in Featured Categories section
    document.querySelectorAll('.featured-cat-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const cat = e.currentTarget.getAttribute('data-category');
        this.setCategory(cat);
        const catalogSec = document.getElementById('shopCatalog');
        if (catalogSec) {
          catalogSec.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Sort select
    const sortSelect = document.getElementById('catalogSortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.currentSort = e.target.value;
        this.applyFiltersAndSort();
      });
    }

    // Load More Button
    const loadMoreBtn = document.getElementById('loadMoreProductsBtn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        this.currentPage++;
        this.renderCatalogPaginated(true);
      });
    }
  }

  setCategory(category) {
    this.currentCategory = category || 'all';
    this.currentPage = 1;

    // Update active UI pills
    document.querySelectorAll('.cat-filter-btn').forEach(btn => {
      const match = btn.getAttribute('data-category') === this.currentCategory;
      btn.classList.toggle('active', match);
    });

    this.applyFiltersAndSort();
  }

  /**
   * Filter and sort products, then render catalog
   */
  applyFiltersAndSort() {
    let result = [...this.allProducts];

    // 1. Category Filter
    if (this.currentCategory && this.currentCategory !== 'all') {
      const catKey = this.currentCategory.toLowerCase();
      result = result.filter(p => {
        const pCat = (p.category || '').toLowerCase();
        return pCat.includes(catKey) || catKey.includes(pCat);
      });
    }

    // 2. Search Query Filter
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(p => {
        const t = (p.title || '').toLowerCase();
        const d = (p.description || '').toLowerCase();
        const b = (p.brand || '').toLowerCase();
        const c = (p.category || '').toLowerCase();
        return t.includes(q) || d.includes(q) || b.includes(q) || c.includes(q);
      });
    }

    // 3. Sorting
    switch (this.currentSort) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'featured':
      default:
        // Default sorting
        break;
    }

    this.filteredProducts = result;
    this.currentPage = 1;
    this.renderCatalogPaginated(false);
  }

  /**
   * Paginated rendering for catalog grid
   */
  renderCatalogPaginated(append = false) {
    const grid = document.getElementById('catalogProductGrid');
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    const loadMoreBtn = document.getElementById('loadMoreProductsBtn');
    const loadMoreInfo = document.getElementById('loadMoreInfo');
    const emptyState = document.getElementById('catalogEmptyState');

    if (!grid) return;

    if (this.filteredProducts.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      if (loadMoreContainer) loadMoreContainer.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    const totalItems = this.filteredProducts.length;
    const displayedCount = Math.min(this.currentPage * this.pageSize, totalItems);
    const visibleProducts = this.filteredProducts.slice(0, displayedCount);

    this.renderProductCards(visibleProducts, 'catalogProductGrid');

    // Update Load More UI
    if (loadMoreContainer && loadMoreBtn) {
      if (displayedCount < totalItems) {
        loadMoreContainer.style.display = 'flex';
        const remaining = totalItems - displayedCount;
        loadMoreBtn.innerHTML = `
          <span>Load More Pieces</span>
          <span class="load-more-badge">${remaining} remaining</span>
        `;
        if (loadMoreInfo) {
          loadMoreInfo.textContent = `Displaying ${displayedCount} of ${totalItems} luxury creations`;
        }
      } else {
        loadMoreContainer.style.display = 'none';
      }
    }
  }

  /**
   * Quick Add to Cart from card
   */
  quickAddToCart(productId) {
    const product = this.allProducts.find(p => p.id === productId);
    if (!product) return;

    window.boutiqueCart.addItem(product, 1, { size: 'M', color: 'Default' });
    if (window.showToast) {
      window.showToast(`Added "${product.title}" to Shopping Bag`, 'success');
    }
  }

  /**
   * Card Wishlist toggle handler
   */
  handleCardWishlistToggle(productId, btnEl) {
    const product = this.allProducts.find(p => p.id === productId);
    if (!product) return;

    const isSaved = window.boutiqueWishlist.toggle(product);
    btnEl.classList.toggle('active', isSaved);
    const svg = btnEl.querySelector('svg');
    if (svg) {
      if (isSaved) {
        svg.setAttribute('fill', '#c5a880');
        svg.setAttribute('stroke', '#c5a880');
      } else {
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
      }
    }
  }

  /**
   * Flash Couture Sale live countdown timer
   */
  initCountdownTimer() {
    const hoursEl = document.getElementById('promoHours');
    const minsEl = document.getElementById('promoMins');
    const secsEl = document.getElementById('promoSecs');

    if (!hoursEl || !minsEl || !secsEl) return;

    // Set countdown for 48 hours from today
    let targetTime = Date.now() + (47 * 3600 + 59 * 60 + 59) * 1000;

    const updateTimer = () => {
      const now = Date.now();
      let diff = targetTime - now;

      if (diff <= 0) {
        targetTime = Date.now() + 48 * 3600 * 1000; // Reset
        diff = targetTime - now;
      }

      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      hoursEl.textContent = String(hours).padStart(2, '0');
      minsEl.textContent = String(minutes).padStart(2, '0');
      secsEl.textContent = String(seconds).padStart(2, '0');
    };

    updateTimer();
    setInterval(updateTimer, 1000);
  }

  /**
   * Newsletter subscription handling
   */
  initNewsletter() {
    const form = document.getElementById('newsletterForm');
    const responseBox = document.getElementById('newsletterResponse');

    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      const email = emailInput ? emailInput.value.trim() : '';

      if (!email || !email.includes('@')) {
        window.showToast('Please enter a valid email address.', 'error');
        return;
      }

      // Simulate registration
      form.style.display = 'none';
      if (responseBox) {
        responseBox.innerHTML = `
          <div class="newsletter-success-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c5a880" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <h4>Welcome to the Atelier Circle, ${email.split('@')[0]}</h4>
            <p>Your complimentary 20% discount code has been reserved:</p>
            <div class="copy-coupon-wrap">
              <span class="coupon-code-pill">ELEGANCE20</span>
              <button type="button" class="btn-copy-code" onclick="navigator.clipboard.writeText('ELEGANCE20'); window.showToast('Code copied to clipboard!', 'success');">Copy Code</button>
            </div>
          </div>
        `;
        responseBox.style.display = 'block';
      }

      window.showToast('VIP invitation and voucher activated!', 'success');
    });
  }

  /**
   * Smooth AOS (Animate On Scroll) initialization
   */
  initAOS() {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 750,
        easing: 'ease-out-cubic',
        once: true,
        offset: 80
      });
    }
  }
}

// Global App Initialization
document.addEventListener('DOMContentLoaded', () => {
  window.boutiqueApp = new BoutiqueApp();
});
