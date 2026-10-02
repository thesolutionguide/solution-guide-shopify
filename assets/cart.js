// Cart functionality
const cartDrawer = {
  isOpen: false,
  items: [],
  
  init() {
    this.loadCart();
    this.attachEventListeners();
  },
  
  loadCart() {
    const stored = localStorage.getItem('solGuideCart');
    this.items = stored ? JSON.parse(stored) : [];
  },
  
  saveCart() {
    localStorage.setItem('solGuideCart', JSON.stringify(this.items));
    this.updateCartCount();
  },
  
  attachEventListeners() {
    document.querySelectorAll('form.add-to-cart-form').forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const productId = form.querySelector('input[name="id"]').value;
        const productTitle = form.closest('.product-card').querySelector('.product-title').textContent;
        const productPrice = form.closest('.product-card').querySelector('.product-price').textContent;
        
        this.addItem({
          id: productId,
          title: productTitle,
          price: productPrice,
          quantity: 1
        });
      });
    });
  },
  
  addItem(item) {
    const existingItem = this.items.find(i => i.id === item.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.items.push(item);
    }
    
    this.saveCart();
    this.showNotification('Item added to cart!');
  },
  
  removeItem(id) {
    this.items = this.items.filter(item => item.id !== id);
    this.saveCart();
  },
  
  updateQuantity(id, quantity) {
    const item = this.items.find(i => i.id === id);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.saveCart();
    }
  },
  
  open() {
    if (!this.isOpen) {
      this.render();
      this.isOpen = true;
    }
  },
  
  close() {
    const drawer = document.getElementById('cartDrawer');
    if (drawer) {
      drawer.remove();
    }
    this.isOpen = false;
  },
  
  updateCartCount() {
    const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon && count > 0) {
      cartIcon.setAttribute('data-count', count);
    }
  },
  
  getTotal() {
    return this.items.reduce((sum, item) => {
      const price = parseFloat(item.price.replace('$', ''));
      return sum + (price * item.quantity);
    }, 0);
  },
  
  render() {
    const drawer = document.createElement('div');
    drawer.id = 'cartDrawer';
    drawer.innerHTML = `
      <div class="cart-drawer-overlay"></div>
      <div class="cart-drawer-content">
        <div class="cart-header">
          <h2>Shopping Cart</h2>
          <button onclick="cartDrawer.close()" class="close-btn">✕</button>
        </div>
        
        <div class="cart-items">
          ${this.items.length > 0 ? this.renderItems() : '<p class="empty-cart">Your cart is empty</p>'}
        </div>
        
        ${this.items.length > 0 ? `
          <div class="cart-summary">
            <div class="cart-total">
              <span>Total:</span>
              <span>$${this.getTotal().toFixed(2)}</span>
            </div>
            <button onclick="cartDrawer.checkout()" class="checkout-btn">Proceed to Checkout</button>
            <button onclick="cartDrawer.close()" class="continue-shopping-btn">Continue Shopping</button>
          </div>
        ` : ''}
      </div>
    `;
    
    document.body.appendChild(drawer);
    this.attachCartEventListeners();
  },
  
  renderItems() {
    return this.items.map(item => `
      <div class="cart-item">
        <div class="item-details">
          <h4>${item.title}</h4>
          <p>${item.price}</p>
        </div>
        <div class="item-controls">
          <input type="number" value="${item.quantity}" min="1" onchange="cartDrawer.updateQuantity('${item.id}', this.value)">
          <button onclick="cartDrawer.removeItem('${item.id}'); cartDrawer.render()">Remove</button>
        </div>
      </div>
    `).join('');
  },
  
  attachCartEventListeners() {
    document.querySelector('.cart-drawer-overlay').addEventListener('click', () => this.close());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  },
  
  checkout() {
    // Redirect to Shopify checkout with cart items
    const cartJSON = encodeURIComponent(JSON.stringify(this.items));
    window.location.href = '/cart?items=' + cartJSON;
  },
  
  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  cartDrawer.init();
});
