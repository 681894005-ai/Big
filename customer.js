// customer.js - Customer Front-end & Loyalty Ordering System
import { DB } from './db.js?v=5';

const CATEGORY_STYLES = {
  "Coffee": { emoji: "☕", gradient: "linear-gradient(135deg, #1e1b18, #2a1f1a)" },
  "Bakery": { emoji: "🥐", gradient: "linear-gradient(135deg, #2b1f1d, #3c2f2f)" },
  "Other Drinks": { emoji: "🍵", gradient: "linear-gradient(135deg, #0f2027, #172c33)" }
};

export const CustomerView = {
  // Store reference to state and actions for inner rendering
  stateRef: null,
  actionsRef: null,

  async render(containerId, globalState, actions) {
    this.stateRef = globalState;
    this.actionsRef = actions;
    const container = document.getElementById(containerId);
    if (!container) return;

    // Reset container with customer template
    container.innerHTML = `
      <div class="customer-layout">
        <!-- Menu Section -->
        <div class="menu-section">
          <!-- Hero Banner -->
          <div class="hero-banner">
            <h1 class="hero-title">ยินดีต้อนรับสู่ <span>Aroma Cafe</span></h1>
            <p class="hero-subtitle">สั่งเครื่องดื่มกาแฟอาราบิก้าคัดพิเศษ เบเกอรี่โฮมเมดแสนอร่อย สะสมคะแนนได้ง่ายๆ ค้นหาด้วยเบอร์โทรศัพท์เพื่อใช้สิทธิ์แลกส่วนลด</p>
            
            <!-- Category Pills -->
            <div class="categories-container" id="category-filters">
              <button class="category-pill active" data-category="all">ทั้งหมด (All)</button>
              <button class="category-pill" data-category="Coffee">กาแฟ (Coffee)</button>
              <button class="category-pill" data-category="Bakery">เบเกอรี่ (Bakery)</button>
              <button class="category-pill" data-category="Other Drinks">เครื่องดื่มอื่นๆ (Drinks)</button>
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
    await this.renderMenuGrid(globalState.currentCategory || 'all');
    this.renderCart(globalState.cart, actions);

    // Bind event listeners
    this.bindEvents(globalState, actions);
  },

  async renderMenuGrid(categoryFilter) {
    const gridContainer = document.getElementById("menu-grid-container");
    if (!gridContainer) return;

    // Show loading spinner
    gridContainer.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text-light);">
        <svg class="animate-spin" style="width:38px; height:38px; margin:0 auto; animation: spin 1s linear infinite;" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" style="opacity:0.25;"></circle>
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style="opacity:0.75;"></path>
        </svg>
        <p style="margin-top:0.75rem; font-weight:500;">กำลังโหลดเมนู...</p>
      </div>
      <style>
        @keyframes spin { from {transform:rotate(0deg);} to {transform:rotate(360deg);} }
      </style>
    `;

    const menuItems = await DB.getMenu();
    const filteredItems = categoryFilter === 'all' 
      ? menuItems 
      : menuItems.filter(item => item.category === categoryFilter);

    if (filteredItems.length === 0) {
      gridContainer.innerHTML = `
        <div class="cart-empty" style="grid-column: 1/-1; height: 300px;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:64px; height:64px;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p style="font-weight:600; font-size:1.1rem; margin-top:1rem;">ไม่พบรายการเมนูในหมวดหมู่นี้</p>
        </div>
      `;
      return;
    }

    gridContainer.innerHTML = filteredItems.map(item => {
      const catStyle = CATEGORY_STYLES[item.category] || { emoji: "🍽️", gradient: "linear-gradient(135deg, #0f172a, #1e293b)" };
      // Map category name to lower-case class style compatible with CSS
      const badgeClass = `badge-${item.category.replace(/\s+/g, '').toLowerCase()}`;
      const statusClass = item.available ? '' : 'unavailable';
      
      const fallbackStyle = `background: ${catStyle.gradient}; display: flex; align-items: center; justify-content: center; font-size: 4rem; color: #64748b; position: relative;`;

      return `
        <div class="menu-card ${statusClass}" data-id="${item.id}">
          <div class="menu-card-img-container" style="${fallbackStyle}">
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
            <p class="menu-card-desc">${item.description || 'ไม่มีคำอธิบายเมนู'}</p>
            <div class="menu-card-footer">
              <span class="menu-card-price">${item.price}</span>
              ${item.available 
                ? `<button class="add-cart-btn btn-add-to-cart" data-id="${item.id}">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg> สั่งซื้อ
                   </button>`
                : `<button class="add-cart-btn" disabled style="background-color:var(--border-color); color:var(--text-light); border-color:transparent; cursor:not-allowed;">หมด</button>`
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

    const globalState = this.stateRef;
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const vat = parseFloat((subtotal * 0.07).toFixed(2));
    let total = parseFloat((subtotal + vat).toFixed(2));

    // Calculate pending points: 10 points per coffee item
    let coffeeQty = 0;
    cart.forEach(item => {
      // Simple name check or let's lookup category. If it's a coffee item (starts with c1-c4, or Coffee in local cache)
      const menu = JSON.parse(localStorage.getItem("coffee_menu")) || [];
      const menuItem = menu.find(mi => mi.id === item.id);
      if (menuItem && menuItem.category === "Coffee") {
        coffeeQty += item.quantity;
      }
    });
    const pendingPoints = coffeeQty * 10;

    // Apply loyalty discount: Use 100 points for a 50 Baht discount
    let discountApplied = 0;
    if (globalState.selectedMember && globalState.redeemDiscount && globalState.selectedMember.points >= 100) {
      discountApplied = 50;
      total = Math.max(0, parseFloat((total - 50).toFixed(2)));
    }

    let cartContentHtml = `
      <div class="cart-header">
        <h2 class="cart-title">
          รายการสั่งซื้อ 
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
            <p>ยังไม่มีสินค้าในตะกร้า</p>
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

        <!-- --- LOYALTY MEMBER PORTAL IN CART --- -->
        <div class="member-search-container">
          ${!globalState.selectedMember 
            ? `<div class="member-search-header">
                <span>👤 ค้นหาสมาชิกสะสมแต้ม</span>
               </div>
               <div class="member-search-box">
                <input type="tel" id="member-search-phone" class="member-search-input" placeholder="กรอกเบอร์โทรศัพท์ (10 หลัก)..." maxlength="10">
                <button id="btn-search-member" class="member-search-btn">ค้นหา</button>
               </div>
               <div id="member-search-msg" style="font-size:0.75rem; color:var(--danger-dark); text-align:center; display:none; margin-top:0.25rem;"></div>`
            : `<div class="member-search-header">
                <span>👤 สมาชิกผู้ได้รับสิทธิ์</span>
                <button id="btn-clear-member" style="color:var(--danger-dark); font-size:0.75rem; font-weight:700;">ยกเลิก</button>
               </div>
               <div class="member-info-box">
                <div class="member-info-row">
                  <strong>${globalState.selectedMember.name}</strong>
                  <span class="member-points-badge">${globalState.selectedMember.points} แต้ม</span>
                </div>
                <div style="font-size:0.75rem; color:var(--text-muted);">เบอร์โทร: ${globalState.selectedMember.phone}</div>
                
                ${globalState.selectedMember.points >= 100 
                  ? `<div class="member-redeem-row">
                      <input type="checkbox" id="chk-redeem-points" ${globalState.redeemDiscount ? 'checked' : ''} style="width:16px; height:16px; cursor:pointer;">
                      <label for="chk-redeem-points" style="font-size:0.8rem; cursor:pointer; color:var(--primary-dark);">ใช้ 100 แต้ม แลกส่วนลด 50 บาท</label>
                     </div>`
                  : `<div style="font-size:0.72rem; color:var(--text-light); margin-top:0.25rem; font-style:italic;">
                      *ต้องการ 100 แต้มเพื่อแลกส่วนลด 50 บาท (ขาดอีก ${100 - globalState.selectedMember.points} แต้ม)
                     </div>`
                }
               </div>`
          }
          
          ${pendingPoints > 0 
            ? `<div class="member-earned-points">☕ สั่งซื้อรอบนี้จะได้รับแต้มสะสม: +${pendingPoints} คะแนน</div>` 
            : ''
          }
        </div>

        <div class="cart-summary">
          <div class="summary-row">
            <span>ค่าสินค้า (Subtotal)</span>
            <span>${subtotal.toFixed(2)} ฿</span>
          </div>
          <div class="summary-row">
            <span>ภาษีมูลค่าเพิ่ม (VAT 7%)</span>
            <span>${vat.toFixed(2)} ฿</span>
          </div>
          ${discountApplied > 0 
            ? `<div class="summary-row" style="color: var(--success); font-weight:600;">
                <span>ส่วนลดสมาชิก (Redeem Points)</span>
                <span>-${discountApplied.toFixed(2)} ฿</span>
               </div>` 
            : ''
          }
          <div class="summary-row total">
            <span>ยอดรวมสุทธิ (Total)</span>
            <span>${total.toFixed(2)} ฿</span>
          </div>
        </div>

        <form class="checkout-form" id="checkout-form" onsubmit="return false;">
          <div class="input-group">
            <label for="customer-name">หมายเลขโต๊ะ / ชื่อลูกค้า (Walk-in Table)</label>
            <input type="text" id="customer-name" class="form-input" placeholder="ตัวอย่าง: โต๊ะ 3 หรือ คุณนารี" required>
          </div>
          <button type="submit" class="checkout-btn" id="btn-submit-order">ยืนยันสั่งซื้อ/พิมพ์บิล (Send to POS)</button>
        </form>
      `;
    }

    cartSidebar.innerHTML = cartContentHtml;
  },

  bindEvents(globalState, actions) {
    // --- Category Filtering ---
    const categoryContainer = document.getElementById("category-filters");
    if (categoryContainer) {
      categoryContainer.addEventListener("click", async (e) => {
        const btn = e.target.closest(".category-pill");
        if (!btn) return;

        // Toggle active style
        categoryContainer.querySelectorAll(".category-pill").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");

        const category = btn.dataset.category;
        globalState.currentCategory = category;
        await this.renderMenuGrid(category);
      });
    }

    // --- Menu Grid Actions (Add to Cart) ---
    const gridContainer = document.getElementById("menu-grid-container");
    if (gridContainer) {
      gridContainer.addEventListener("click", async (e) => {
        const addBtn = e.target.closest(".btn-add-to-cart");
        if (!addBtn) return;

        const itemId = addBtn.dataset.id;
        const menuItems = await DB.getMenu();
        const item = menuItems.find(i => i.id === itemId);
        if (item) {
          actions.addToCart(item);
        }
      });
    }

    // --- Cart Sidebar Actions ---
    const cartSidebar = document.getElementById("cart-sidebar");
    if (cartSidebar) {
      cartSidebar.addEventListener("click", async (e) => {
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

        // Loyalty Search Member
        const searchBtn = e.target.closest("#btn-search-member");
        if (searchBtn) {
          const phoneInput = document.getElementById("member-search-phone");
          const phone = phoneInput ? phoneInput.value.trim() : "";
          const msgDiv = document.getElementById("member-search-msg");
          
          if (!phone || phone.length < 9) {
            if (msgDiv) {
              msgDiv.textContent = "⚠️ กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง";
              msgDiv.style.display = "block";
            }
            return;
          }

          // Show loading
          searchBtn.disabled = true;
          searchBtn.textContent = "ค้นหา...";
          
          try {
            const member = await DB.findMemberByPhone(phone);
            searchBtn.disabled = false;
            searchBtn.textContent = "ค้นหา";
            
            if (member) {
              globalState.selectedMember = member;
              globalState.redeemDiscount = false;
              actions.showToast(`พบสมาชิก: ${member.name} (${member.points} แต้ม)`, 'success');
              this.renderCart(globalState.cart, actions);
            } else {
              if (msgDiv) {
                msgDiv.style.display = "block";
                msgDiv.innerHTML = `
                  ไม่พบข้อมูลสมาชิก <br>
                  <button id="btn-show-register" class="member-search-btn" style="margin-top:0.35rem; font-size:0.75rem; padding:0.25rem 0.5rem;">คลิกเพื่อลงทะเบียนใหม่</button>
                `;
              }
            }
          } catch (err) {
            searchBtn.disabled = false;
            searchBtn.textContent = "ค้นหา";
            actions.showToast("เกิดข้อผิดพลาดในการดึงข้อมูลจาก Supabase", 'danger');
          }
          return;
        }

        // Click to register
        const showRegBtn = e.target.closest("#btn-show-register");
        if (showRegBtn) {
          const phoneInput = document.getElementById("member-search-phone");
          const phone = phoneInput ? phoneInput.value.trim() : "";
          this.showRegisterModal(phone, globalState, actions);
          return;
        }

        // Cancel Loyalty member selection
        const clearMemberBtn = e.target.closest("#btn-clear-member");
        if (clearMemberBtn) {
          globalState.selectedMember = null;
          globalState.redeemDiscount = false;
          actions.showToast("ยกเลิกการเลือกสมาชิก", "info");
          this.renderCart(globalState.cart, actions);
          return;
        }
      });

      // Handle checkbox change
      cartSidebar.addEventListener("change", (e) => {
        const redeemCheck = e.target.closest("#chk-redeem-points");
        if (redeemCheck) {
          globalState.redeemDiscount = redeemCheck.checked;
          this.renderCart(globalState.cart, actions);
        }
      });

      // Checkout submit (creating order)
      cartSidebar.addEventListener("submit", async (e) => {
        const form = e.target.closest("#checkout-form");
        if (!form) return;
        
        e.preventDefault();
        const customerNameInput = document.getElementById("customer-name");
        const customerName = customerNameInput ? customerNameInput.value.trim() : "";
        
        if (!customerName) return;

        // Keep local references for success modal since actions.clearCart will clear globalState
        const orderMember = globalState.selectedMember ? { ...globalState.selectedMember } : null;
        const orderRedeem = globalState.redeemDiscount;

        const newOrder = await DB.createOrder(customerName, globalState.cart, globalState.selectedMember, globalState.redeemDiscount);
        
        // Track Purchase in Google Analytics
        if (typeof window.gtag === 'function' && newOrder) {
          window.gtag('event', 'purchase', {
            transaction_id: newOrder.id,
            value: newOrder.total,
            currency: 'THB',
            tax: newOrder.vat,
            items: newOrder.items.map(item => ({
              item_id: item.id,
              item_name: item.name,
              price: item.price,
              quantity: item.quantity
            }))
          });
        }

        // Show success modal
        this.showSuccessModal(newOrder, orderMember, orderRedeem);
        
        // Clear cart and state variables
        actions.clearCart();
      });
    }
  },

  showRegisterModal(initialPhone, globalState, actions) {
    const modalDiv = document.createElement("div");
    modalDiv.className = "modal-overlay";
    modalDiv.id = "register-member-modal";
    modalDiv.innerHTML = `
      <div class="modal-content" style="max-width: 400px;">
        <div class="modal-header">
          <h3 class="modal-title">📝 ลงทะเบียนสมาชิกใหม่</h3>
          <button class="modal-close-btn" id="btn-close-reg">×</button>
        </div>
        <form id="reg-member-form">
          <div class="modal-body" style="display:flex; flex-direction:column; gap:1rem;">
            <div class="input-group">
              <label for="reg-phone">เบอร์โทรศัพท์ (10 หลัก)</label>
              <input type="tel" id="reg-phone" class="form-input" value="${initialPhone}" required maxlength="10" placeholder="08xxxxxxxx">
            </div>
            <div class="input-group">
              <label for="reg-name">ชื่อ-นามสกุลสมาชิก</label>
              <input type="text" id="reg-name" class="form-input" required placeholder="ตัวอย่าง: คุณเก่ง กาแฟดี">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="modal-btn cancel" id="btn-cancel-reg">ยกเลิก</button>
            <button type="submit" class="modal-btn confirm" id="btn-confirm-reg">สมัครสมาชิก</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modalDiv);

    // Close logic
    const closeModal = () => modalDiv.remove();
    modalDiv.querySelector("#btn-close-reg").addEventListener("click", closeModal);
    modalDiv.querySelector("#btn-cancel-reg").addEventListener("click", closeModal);

    // Submit logic
    modalDiv.querySelector("#reg-member-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const phone = document.getElementById("reg-phone").value.trim();
      const name = document.getElementById("reg-name").value.trim();
      
      const confirmBtn = document.getElementById("btn-confirm-reg");
      confirmBtn.disabled = true;
      confirmBtn.textContent = "กำลังลงทะเบียน...";

      try {
        const result = await DB.registerMember(name, phone);
        if (result.success) {
          globalState.selectedMember = result.member;
          globalState.redeemDiscount = false;
          actions.showToast(`ลงทะเบียนสมาชิก ${name} สำเร็จ!`, 'success');
          closeModal();
          this.renderCart(globalState.cart, actions);
        } else {
          actions.showToast(result.message, 'danger');
          confirmBtn.disabled = false;
          confirmBtn.textContent = "สมัครสมาชิก";
        }
      } catch (err) {
        actions.showToast("ลงทะเบียนสมาชิกล้มเหลว กรุณาลองใหม่", 'danger');
        confirmBtn.disabled = false;
        confirmBtn.textContent = "สมัครสมาชิก";
      }
    });
  },

  showSuccessModal(order, member, redeem) {
    const modalDiv = document.createElement("div");
    modalDiv.className = "modal-overlay";
    modalDiv.id = "success-order-modal";
    
    // Loyalty details inside receipt modal
    let loyaltyHtml = '';
    if (member) {
      const finalPoints = member.points + order.pointsEarned - (redeem ? 100 : 0);
      loyaltyHtml = `
        <div style="background-color: var(--primary-light); border: 1px solid rgba(133, 77, 14, 0.15); border-radius: var(--radius-sm); padding: 0.75rem; margin-bottom: 1.25rem; font-size: 0.85rem; text-align: left;">
          <div style="font-weight: 700; color: var(--primary); margin-bottom: 0.25rem;">✨ สรุปการสะสมแต้มสมาชิก:</div>
          <div>สมาชิก: <strong>${member.name}</strong></div>
          <div>แต้มเดิม: ${member.points} แต้ม</div>
          ${redeem ? `<div style="color: var(--danger-dark);">แลกส่วนลด: -100 แต้ม</div>` : ''}
          ${order.pointsEarned > 0 ? `<div style="color: var(--success);">ได้รับจากการสั่งซื้อกาแฟ: +${order.pointsEarned} แต้ม</div>` : ''}
          <div style="border-top: 1px dashed var(--border-color); margin-top: 0.35rem; padding-top: 0.35rem; font-weight:700;">
            แต้มสะสมสุทธิ: <span style="color: var(--primary-dark); font-size: 1.05rem;">${finalPoints} แต้ม</span>
          </div>
        </div>
      `;
    }

    modalDiv.innerHTML = `
      <div class="modal-content" style="max-width: 400px; text-align: center;">
        <div class="modal-body" style="padding: 2.5rem 1.5rem;">
          <div style="font-size: 4rem; margin-bottom: 1rem;">☕</div>
          <h2 style="font-family: var(--font-display); font-weight: 800; font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--primary);">ส่งเข้าครัวสำเร็จ!</h2>
          <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem;">
            รายการสั่งซื้อหมายเลข <strong style="color: var(--text-dark);">${order.id}</strong> สำหรับ <strong>${order.customerName}</strong> ได้ส่งเข้าสู่ระบบแคชเชียร์ของพนักงานเรียบร้อยแล้ว
          </p>
          
          ${loyaltyHtml}
          
          <div style="background-color: var(--bg-light); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.5rem; font-size: 0.85rem; text-align: left;">
            <div style="font-weight: 700; border-bottom: 1px dashed var(--border-color); padding-bottom: 0.5rem; margin-bottom: 0.5rem;">สรุปคำสั่งซื้อ:</div>
            ${order.items.map(item => `
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                <span>x${item.quantity} ${item.name}</span>
                <span>${item.price * item.quantity} ฿</span>
              </div>
            `).join('')}
            
            ${redeem 
              ? `<div style="display: flex; justify-content: space-between; color: var(--danger-dark); margin-bottom: 0.25rem;">
                  <span>ส่วนลดสมาชิก (Redeem Points)</span>
                  <span>-50.00 ฿</span>
                 </div>` 
              : ''
            }
            
            <div style="display: flex; justify-content: space-between; font-weight: 700; margin-top: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 0.5rem; color: var(--primary);">
              <span>ยอดรวมสุทธิ (รวม VAT)</span>
              <span>${order.total.toFixed(2)} ฿</span>
            </div>
          </div>
          <button class="modal-btn confirm" id="btn-close-success" style="width: 100%;">สั่งอาหาร/เครื่องดื่มเพิ่ม</button>
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
