// customer.js - Customer Front-end Component
import { DB } from './db.js?v=3';

// Maps category name to emoji and gradient classes for fallback placeholders
const CATEGORY_STYLES = {
  "Main": { emoji: "🍛", gradient: "linear-gradient(135deg, #1e1b18, #2a1f1a)" },
  "Dessert": { emoji: "🥭", gradient: "linear-gradient(135deg, #1f1225, #2c1a35)" },
  "Drinks": { emoji: "🍹", gradient: "linear-gradient(135deg, #0f2027, #172c33)" }
};

export const CustomerView = {
  render(containerId, globalState, actions) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Reset container with customer template
    container.innerHTML = `
      <div class="customer-layout">
        <!-- Menu Section -->
        <div class="menu-section">
          <!-- Hero Banner -->
          <div class="hero-banner">
            <h1 class="hero-title">สั่งอาหารอร่อย ส่งตรงถึงโต๊ะ <span>AroyDee</span></h1>
            <p class="hero-subtitle">เลือกสรรเมนูอาหารไทยรสชาติต้นตำรับ วัตถุดิบสดใหม่ สะอาด ปรุงร้อนพร้อมเสิร์ฟทุกจาน สั่งง่ายๆ เพียงไม่กี่ขั้นตอน</p>
            
            <!-- Category Pills -->
            <div class="categories-container" id="category-filters">
              <button class="category-pill active" data-category="all">ทั้งหมด (All)</button>
              <button class="category-pill" data-category="Main">อาหารหลัก (Main)</button>
              <button class="category-pill" data-category="Dessert">ของหวาน (Dessert)</button>
              <button class="category-pill" data-category="Drinks">เครื่องดื่ม (Drinks)</button>
            </div>
          </div>

          <!-- Menu Grid -->
          <div class="menu-grid" id="menu-grid-container">
            <!-- Dynamic menu items will load here -->
          </div>
        </div>

        <!-- Sidebar Cart -->
        <div class="cart-section" id="cart-sidebar">
          <!-- Dynamic cart will load here -->
        </div>
      </div>
    `;

    // Render components
    this.renderMenuGrid(globalState.currentCategory || 'all');
    this.renderCart(globalState.cart, actions);

    // Bind event listeners
    this.bindEvents(globalState, actions);
  },

  renderMenuGrid(categoryFilter) {
    const gridContainer = document.getElementById("menu-grid-container");
    if (!gridContainer) return;

    const menuItems = DB.getMenu();
    const filteredItems = categoryFilter === 'all' 
      ? menuItems 
      : menuItems.filter(item => item.category === categoryFilter);

    if (filteredItems.length === 0) {
      gridContainer.innerHTML = `
        <div class="cart-empty" style="grid-column: 1/-1; height: 300px;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:64px; height:64px;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p style="font-weight:600; font-size:1.1rem; margin-top:1rem;">ไม่พบรายการอาหารในหมวดหมู่นี้</p>
        </div>
      `;
      return;
    }

    gridContainer.innerHTML = filteredItems.map(item => {
      const catStyle = CATEGORY_STYLES[item.category] || { emoji: "🍽️", gradient: "linear-gradient(135deg, #0f172a, #1e293b)" };
      const badgeClass = `badge-${item.category.toLowerCase()}`;
      const statusClass = item.available ? '' : 'unavailable';
      
      // Inline styling for the image container to render a beautiful fallback gradient + emoji
      const fallbackStyle = `background: ${catStyle.gradient}; display: flex; align-items: center; justify-content: center; font-size: 4rem; color: #64748b; position: relative;`;

      return `
        <div class="menu-card ${statusClass}" data-id="${item.id}">
          <div class="menu-card-img-container" style="${fallbackStyle}">
            <!-- The emoji is centered as a fallback behind the image -->
            <span style="user-select: none;">${catStyle.emoji}</span>
            <img 
              src="${item.image}" 
              alt="${item.name}" 
              class="menu-card-img" 
              style="position: absolute; top:0; left:0; width:100%; height:100%; object-fit:cover;"
              onload="this.style.opacity = 1"
              onerror="this.style.display = 'none'; this.previousElementSibling.style.opacity = 1;"
            >
            <span class="menu-card-badge ${badgeClass}">${item.category}</span>
          </div>
          <div class="menu-card-content">
            <h3 class="menu-card-title">${item.name}</h3>
            <p class="menu-card-desc">${item.description || 'ไม่มีรายละเอียดอาหาร'}</p>
            <div class="menu-card-footer">
              <span class="menu-card-price">${item.price}</span>
              ${item.available 
                ? `<button class="add-cart-btn btn-add-to-cart" data-id="${item.id}">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg> สั่งซื้อ
                   </button>`
                : `<button class="add-cart-btn" disabled style="background-color:#1e293b; color:#475569; border-color:transparent; cursor:not-allowed;">หมด</button>`
              }
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderCart(cart, actions) {
    const cartSidebar = document.getElementById("cart-sidebar");
    if (!cartSidebar) return;

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const vat = parseFloat((subtotal * 0.07).toFixed(2));
    const total = parseFloat((subtotal + vat).toFixed(2));

    let cartContentHtml = `
      <div class="cart-header">
        <h2 class="cart-title">
          ตะกร้าสินค้า 
          <span class="cart-count-badge" id="cart-count">${cartCount}</span>
        </h2>
        ${cart.length > 0 ? `<button class="clear-cart-btn" id="btn-clear-cart">ล้างตะกร้า</button>` : ''}
      </div>
    `;

    if (cart.length === 0) {
      cartContentHtml += `
        <div class="cart-items-container">
          <div class="cart-empty">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p>ยังไม่มีรายการอาหารในตะกร้า</p>
          </div>
        </div>
      `;
    } else {
      cartContentHtml += `
        <div class="cart-items-container">
          ${cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
              <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${item.price * item.quantity} ฿</div>
              </div>
              <div class="cart-item-controls">
                <button class="cart-qty-btn btn-qty-minus" data-id="${item.id}">-</button>
                <span class="cart-qty-val">${item.quantity}</span>
                <button class="cart-qty-btn btn-qty-plus" data-id="${item.id}">+</button>
                <button class="cart-remove-btn btn-remove-item" data-id="${item.id}" title="ลบรายการ">
                  <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="cart-summary">
          <div class="summary-row">
            <span>ค่าอาหาร (Subtotal)</span>
            <span>${subtotal.toFixed(2)} ฿</span>
          </div>
          <div class="summary-row">
            <span>ภาษีมูลค่าเพิ่ม (VAT 7%)</span>
            <span>${vat.toFixed(2)} ฿</span>
          </div>
          <div class="summary-row total">
            <span>ยอดรวมทั้งสิ้น (Total)</span>
            <span>${total.toFixed(2)} ฿</span>
          </div>
        </div>

        <form class="checkout-form" id="checkout-form" onsubmit="return false;">
          <div class="input-group">
            <label for="customer-name">หมายเลขโต๊ะ / ชื่อลูกค้า</label>
            <input type="text" id="customer-name" class="form-input" placeholder="ตัวอย่าง: โต๊ะ 5 หรือ คุณกิตติ" required>
          </div>
          <button type="submit" class="checkout-btn" id="btn-submit-order">ยืนยันการสั่งซื้อ (Send to POS)</button>
        </form>
      `;
    }

    cartSidebar.innerHTML = cartContentHtml;
  },

  bindEvents(globalState, actions) {
    // --- Category Filtering ---
    const categoryContainer = document.getElementById("category-filters");
    if (categoryContainer) {
      categoryContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".category-pill");
        if (!btn) return;

        // Toggle active style
        categoryContainer.querySelectorAll(".category-pill").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");

        const category = btn.dataset.category;
        globalState.currentCategory = category;
        this.renderMenuGrid(category);
      });
    }

    // --- Menu Grid Actions (Add to Cart) ---
    const gridContainer = document.getElementById("menu-grid-container");
    if (gridContainer) {
      gridContainer.addEventListener("click", (e) => {
        const addBtn = e.target.closest(".btn-add-to-cart");
        if (!addBtn) return;

        const itemId = addBtn.dataset.id;
        const menuItems = DB.getMenu();
        const item = menuItems.find(i => i.id === itemId);
        if (item) {
          actions.addToCart(item);
        }
      });
    }

    // --- Cart Sidebar Actions ---
    const cartSidebar = document.getElementById("cart-sidebar");
    if (cartSidebar) {
      cartSidebar.addEventListener("click", (e) => {
        // Quantity Plus
        const plusBtn = e.target.closest(".btn-qty-plus");
        if (plusBtn) {
          actions.updateCartQty(plusBtn.dataset.id, 1);
          return;
        }

        // Quantity Minus
        const minusBtn = e.target.closest(".btn-qty-minus");
        if (minusBtn) {
          actions.updateCartQty(minusBtn.dataset.id, -1);
          return;
        }

        // Remove Item
        const removeBtn = e.target.closest(".btn-remove-item");
        if (removeBtn) {
          actions.removeFromCart(removeBtn.dataset.id);
          return;
        }

        // Clear Cart
        const clearBtn = e.target.closest("#btn-clear-cart");
        if (clearBtn) {
          actions.clearCart();
          return;
        }
      });

      // Checkout submit
      cartSidebar.addEventListener("submit", (e) => {
        const form = e.target.closest("#checkout-form");
        if (!form) return;
        
        e.preventDefault();
        const customerNameInput = document.getElementById("customer-name");
        const customerName = customerNameInput ? customerNameInput.value.trim() : "";
        
        if (!customerName) return;

        const newOrder = DB.createOrder(customerName, globalState.cart);
        actions.clearCart();
        
        // Show success modal popup
        this.showSuccessModal(newOrder);
      });
    }
  },

  showSuccessModal(order) {
    const modalDiv = document.createElement("div");
    modalDiv.className = "modal-overlay";
    modalDiv.id = "success-order-modal";
    modalDiv.innerHTML = `
      <div class="modal-content" style="max-width: 400px; text-align: center;">
        <div class="modal-body" style="padding: 2.5rem 1.5rem;">
          <div style="font-size: 4rem; margin-bottom: 1rem;">✅</div>
          <h2 style="font-family: var(--font-display); font-weight: 800; font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--success-dark);">สั่งอาหารสำเร็จ!</h2>
          <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem;">
            รายการสั่งซื้อหมายเลข <strong style="color: var(--text-dark);">${order.id}</strong> สำหรับ <strong>${order.customerName}</strong> ได้ส่งเข้าสู่ระบบครัวของพนักงานเรียบร้อยแล้ว
          </p>
          <div style="background-color: var(--bg-light); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.5rem; font-size: 0.85rem; text-align: left;">
            <div style="font-weight: 700; border-bottom: 1px dashed var(--border-color); padding-bottom: 0.5rem; margin-bottom: 0.5rem;">สรุปคำสั่งซื้อ:</div>
            ${order.items.map(item => `
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                <span>x${item.quantity} ${item.name}</span>
                <span>${item.price * item.quantity} ฿</span>
              </div>
            `).join('')}
            <div style="display: flex; justify-content: space-between; font-weight: 700; margin-top: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 0.5rem; color: var(--primary-dark);">
              <span>ยอดรวมสุทธิ (รวม VAT)</span>
              <span>${order.total.toFixed(2)} ฿</span>
            </div>
          </div>
          <button class="modal-btn confirm" id="btn-close-success" style="width: 100%;">สั่งอาหารเพิ่มอีก</button>
        </div>
      </div>
    `;

    document.body.appendChild(modalDiv);

    const closeBtn = modalDiv.querySelector("#btn-close-success");
    closeBtn.addEventListener("click", () => {
      modalDiv.remove();
    });
  }
};
