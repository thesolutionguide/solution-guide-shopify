const ShopifyCart = {
  items: [],
  
  init() {
    this.loadCart();
    this.setupEventListeners();
  },
  
  loadCart() {
    const stored = localStorage.getItem('shopifyCart');
    this.items = stored ? JSON.parse(stored) : [];
    this.updateCartUI();
  },
  
  saveCart() {
    localStorage.setItem('shopifyCart', JSON.stringify(this.items));
  },
  
  setupEventListeners() {
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = btn.closest('.product-card');
        const productId = card.dataset.productId || Math.random();
        const title = btn.dataset.title || card.querySelector('.product-title').textContent;
        const price = btn.dataset.price || card.querySelector('.product-price').textContent;
        
        this.addToCart({
          id: productId,
          title,
          price,
          quantity: 1
        });
        
        this.showNotification('Added to cart!');
      });
    });
  },
  
  addToCart(product) {
    const existing = this.items.find(item => item.id === product.id);
    
    if (existing) {
      existing.quantity += 1;
    } else {
      this.items.push(product);
    }
    
    this.saveCart();
    this.updateCartUI();
  },
  
  removeFromCart(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.saveCart();
    this.updateCartUI();
  },
  
  updateQuantity(productId, quantity) {
    const item = this.items.find(i => i.id === productId);
    if (item) {
      item.quantity = Math.max(1, parseInt(quantity));
      this.saveCart();
      this.updateCartUI();
    }
  },
  
  updateCartUI() {
    const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
    const countEl = document.querySelector('.cart-count');
    
    if (countEl) {
      if (count > 0) {
        countEl.textContent = count;
        countEl.style.display = 'flex';
      } else {
        countEl.style.display = 'none';
      }
    }
  },
  
  getTotal() {
    return this.items.reduce((sum, item) => {
      const price = parseFloat(item.price.replace('$', '').replace(/,/g, ''));
      return sum + (price * item.quantity);
    }, 0).toFixed(2);
  },
  
  openCart() {
    let drawer = document.querySelector('.cart-drawer');
    
    if (!drawer) {
      drawer = document.createElement('div');
      drawer.className = 'cart-drawer';
      drawer.innerHTML = this.renderCartHTML();
      document.body.appendChild(drawer);
    }
    
    drawer.classList.add('active');
    this.attachCartListeners();
  },
  
  closeCart() {
    const drawer = document.querySelector('.cart-drawer');
    if (drawer) {
      drawer.classList.remove('active');
    }
  },
  
  renderCartHTML() {
    return `
      <div class="cart-drawer-overlay"></div>
      <div class="cart-drawer-content">
        <div class="cart-header">
          <h2>Shopping Cart</h2>
          <button class="close-btn">✕</button>
        </div>
        
        <div class="cart-items" id="cartItemsList">
          ${this.items.length > 0 ? this.renderCartItems() : '<p class="empty-cart">Your cart is empty</p>'}
        </div>
        
        ${this.items.length > 0 ? `
          <div class="cart-summary">
            <div class="cart-total">
              <span>Total:</span>
              <span>$${this.getTotal()}</span>
            </div>
            <button class="checkout-btn" id="checkoutBtn">Proceed to Checkout</button>
            <button class="continue-shopping-btn" id="continueShopping">Continue Shopping</button>
          </div>
        ` : ''}
      </div>
    `;
  },
  
  renderCartItems() {
    return this.items.map(item => `
      <div class="cart-item" data-product-id="${item.id}">
        <div class="item-details">
          <h4>${item.title}</h4>
          <p>$${item.price}</p>
        </div>
        <div class="item-controls">
          <input type="number" value="${item.quantity}" min="1" class="qty-input">
          <button class="remove-btn">Remove</button>
        </div>
      </div>
    `).join('');
  },
  
  attachCartListeners() {
    document.querySelector('.close-btn')?.addEventListener('click', () => {
      this.closeCart();
    });
    
    document.querySelector('.cart-drawer-overlay')?.addEventListener('click', () => {
      this.closeCart();
    });
    
    document.querySelectorAll('.qty-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const productId = e.target.closest('.cart-item').dataset.productId;
        this.updateQuantity(productId, e.target.value);
        this.openCart();
      });
    });
    
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.closest('.cart-item').dataset.productId;
        this.removeFromCart(productId);
        this.openCart();
      });
    });
    
    document.querySelector('#checkoutBtn')?.addEventListener('click', () => {
      window.location.href = '/checkout';
    });
    
    document.querySelector('#continueShopping')?.addEventListener('click', () => {
      this.closeCart();
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeCart();
      }
    });
  },
  
  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 2000);
  }
};

// FAQ Toggle
document.addEventListener('DOMContentLoaded', () => {
  ShopifyCart.init();
  
  document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('active');
    });
  });
});
