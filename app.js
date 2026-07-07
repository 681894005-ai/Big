// app.js - Aroma Cafe Main Application Shell & Coordinator
import { DB } from './db.js?v=5';
import { CustomerView } from './customer.js?v=5';
import { AdminView } from './admin.js?v=5';

// --- GLOBAL APPLICATION STATE ---
const state = {
  currentView: 'customer', // 'customer' or 'admin'
  cart: JSON.parse(localStorage.getItem('coffee_cart')) || [],
  currentCategory: 'all',
  adminTab: 'orders',
  selectedMember: null,    // Active member placing the order
  redeemDiscount: false    // Whether member uses 100 points for a 50 Baht discount
};

// Save cart to local storage whenever it changes
function saveCart() {
  localStorage.setItem('coffee_cart', JSON.stringify(state.cart));
}

// --- APP ACTIONS AND CONTROLLERS ---
const actions = {
  // Navigation Router
  async navigate(view) {
    state.currentView = view;
    
    // Toggle header nav buttons visual state
    document.querySelectorAll('.nav-btn').forEach(btn => {
      if (btn.dataset.target === view) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Track Screen View in Google Analytics
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'screen_view', {
        screen_name: view,
        app_name: 'AromaCafe'
      });
    }

    // Render corresponding view
    if (view === 'customer') {
      await CustomerView.render('main-content', state, actions);
    } else if (view === 'admin') {
      await AdminView.render('main-content', state, actions);
    }
  },

  // Toast Notifications Stack
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Icon mapping
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';
    if (type === 'danger') icon = '🚨';

    toast.innerHTML = `
      <div style="display:flex; align-items:center; gap:0.5rem;">
        <span>${icon}</span>
        <span class="toast-message">${message}</span>
      </div>
      <button class="toast-close">&times;</button>
    `;

    container.appendChild(toast);

    // Auto close after 4s
    const timer = setTimeout(() => {
      toast.style.animation = 'toast-slide-in 0.3s ease reverse forwards';
      toast.addEventListener('animationend', () => toast.remove());
    }, 4000);

    // Manual close
    toast.querySelector('.toast-close').addEventListener('click', () => {
      clearTimeout(timer);
      toast.remove();
    });
  },

  // Cart Operations
  addToCart(item) {
    const existing = state.cart.find(i => i.id === item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      state.cart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1
      });
    }
    
    saveCart();
    this.showToast(`เพิ่ม ${item.name} ลงในตะกร้าแล้ว`, 'success');
    
    // Track Add to Cart in Google Analytics
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'add_to_cart', {
        currency: 'THB',
        value: item.price,
        items: [{
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: 1
        }]
      });
    }

    // Rerender customer views
    CustomerView.renderCart(state.cart, actions);
  },

  updateCartQty(id, delta) {
    const item = state.cart.find(i => i.id === id);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      state.cart = state.cart.filter(i => i.id !== id);
      this.showToast("ลบรายการออกจากตะกร้าเรียบร้อย", 'warning');
      
      // Track Remove from Cart in Google Analytics
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'remove_from_cart', {
          currency: 'THB',
          value: item.price,
          items: [{
            item_id: item.id,
            item_name: item.name,
            price: item.price,
            quantity: 1
          }]
        });
      }
    }

    saveCart();
    
    // Rerender customer views
    CustomerView.renderCart(state.cart, actions);
  },

  removeFromCart(id) {
    const item = state.cart.find(i => i.id === id);
    state.cart = state.cart.filter(i => i.id !== id);
    saveCart();
    
    if (item) {
      this.showToast(`ลบ ${item.name} ออกจากตะกร้าเรียบร้อย`, 'warning');
      
      // Track Remove from Cart in Google Analytics
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'remove_from_cart', {
          currency: 'THB',
          value: item.price,
          items: [{
            item_id: item.id,
            item_name: item.name,
            price: item.price,
            quantity: 1
          }]
        });
      }
    }

    // Rerender customer views
    CustomerView.renderCart(state.cart, actions);
  },

  clearCart() {
    state.cart = [];
    state.selectedMember = null;
    state.redeemDiscount = false;
    saveCart();
    
    // Rerender customer views
    CustomerView.renderCart(state.cart, actions);
  }
};

// --- REAL-TIME UPDATES VIA CUSTOM EVENTS ---

// Listen to order changes
window.addEventListener("db-orders-updated", async () => {
  if (state.currentView === 'admin' && state.adminTab === 'orders') {
    const session = DB.getCurrentSession();
    if (session) {
      await AdminView.renderOrdersBoard(actions);
    }
  }
});

// Listen to menu changes
window.addEventListener("db-menu-updated", async () => {
  if (state.currentView === 'customer') {
    await CustomerView.renderMenuGrid(state.currentCategory);
  }
});

// Listen to employee session changes
window.addEventListener("auth-changed", async () => {
  renderHeaderAuthStatus();
  // Rerender admin dashboard or login form
  if (state.currentView === 'admin') {
    await AdminView.render('main-content', state, actions);
  }
});

// Listen to image load errors
window.addEventListener("image-load-error", (e) => {
  console.warn("Image failed to load:", e.detail);
});

// --- THEME MANAGEMENT ---
function initTheme() {
  const themeToggle = document.getElementById("theme-toggle");
  if (!themeToggle) return;

  const currentTheme = localStorage.getItem("theme") || "dark";
  if (currentTheme === "light") {
    document.body.classList.add("light-mode");
    themeToggle.textContent = "☀️";
  } else {
    document.body.classList.remove("light-mode");
    themeToggle.textContent = "🌙";
  }

  themeToggle.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("light-mode");
    if (isLight) {
      localStorage.setItem("theme", "light");
      themeToggle.textContent = "☀️";
      actions.showToast("เปลี่ยนเป็นโหมดสว่าง (Light Mode)", "info");
    } else {
      localStorage.setItem("theme", "dark");
      themeToggle.textContent = "🌙";
      actions.showToast("เปลี่ยนเป็นโหมดมืด (Dark Mode)", "info");
    }
  });
}

// --- CORE LAYOUT HELPERS ---

// Render auth status indicator in header
function renderHeaderAuthStatus() {
  const container = document.getElementById("auth-status-container");
  if (!container) return;

  const session = DB.getCurrentSession();
  const isSupa = DB.isSupabaseActive() ? "🟢" : "💻"; // Cloud or Local connection icon
  
  if (session) {
    container.innerHTML = `
      <div style="display:flex; align-items:center; gap:0.55rem;">
        <span style="font-size:0.85rem; font-weight:600; color:var(--text-dark);">
          POS: ${isSupa} ${session.name}
        </span>
      </div>
    `;
  } else {
    container.innerHTML = `
      <span style="font-size:0.8rem; color:var(--text-light); display:flex; align-items:center; gap:0.25rem;">
        🛡️ POS Locked
      </span>
    `;
  }
}

// --- APP INITIALIZATION ---
document.addEventListener("DOMContentLoaded", async () => {
  // Init theme selector
  initTheme();

  // Bind Header navigation buttons
  document.getElementById("nav-customer").addEventListener("click", () => {
    actions.navigate('customer');
  });

  document.getElementById("nav-admin").addEventListener("click", () => {
    actions.navigate('admin');
  });

  document.getElementById("brand-logo").addEventListener("click", (e) => {
    e.preventDefault();
    actions.navigate('customer');
  });

  // Render initial view
  await actions.navigate('customer');
  renderHeaderAuthStatus();
});
