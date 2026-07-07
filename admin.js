// admin.js - Employee Back-office & POS Dashboard
import { DB } from './db.js?v=4';

export const AdminView = {
  render(containerId, globalState, actions) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const session = DB.getCurrentSession();

    if (!session) {
      this.renderLogin(container, actions);
    } else {
      this.renderDashboard(container, session, globalState, actions);
    }
  },

  // --- EMPLOYEE LOGIN VIEW ---
  renderLogin(container, actions) {
    container.innerHTML = `
      <div class="login-layout">
        <div class="login-card">
          <div class="login-header">
            <div class="login-icon">🔑</div>
            <h2 class="login-title">พนักงานเข้าสู่ระบบ</h2>
            <p class="login-subtitle">ระบบบริการร้านอาหารและจัดการ POS</p>
          </div>
          <form class="login-form" id="login-form" onsubmit="return false;">
            <div class="input-group">
              <label for="login-username">ชื่อผู้ใช้งาน (Username)</label>
              <input type="text" id="login-username" class="form-input" placeholder="กรอกชื่อผู้ใช้งาน..." required autocomplete="username">
            </div>
            <div class="input-group">
              <label for="login-password">รหัสผ่าน (Password)</label>
              <input type="password" id="login-password" class="form-input" placeholder="กรอกรหัสผ่าน..." required autocomplete="current-password">
            </div>
            <button type="submit" class="login-btn">เข้าสู่ระบบ (Login)</button>
          </form>
          <div style="font-size:0.75rem; color:var(--text-light); text-align:center; margin-top:-0.5rem; line-height:1.4;">
            ทดสอบสิทธิ์ผู้จัดการ: admin / admin123<br>
            ทดสอบสิทธิ์พนักงาน: staff / staff123
          </div>
        </div>
      </div>
    `;

    // Bind login event
    const form = document.getElementById("login-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const usernameInput = document.getElementById("login-username");
        const passwordInput = document.getElementById("login-password");
        
        const username = usernameInput ? usernameInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value : "";

        const result = DB.login(username, password);
        if (result.success) {
          actions.showToast(`ยินดีต้อนรับคุณ ${result.session.name}`, 'success');
          // View will re-render automatically because app listens to auth-changed event
        } else {
          actions.showToast(result.message, 'danger');
        }
      });
    }
  },

  // --- POS DASHBOARD VIEW ---
  renderDashboard(container, session, globalState, actions) {
    const currentTab = globalState.adminTab || 'orders';

    container.innerHTML = `
      <div class="admin-layout">
        <!-- Dashboard Sub-Header -->
        <div class="admin-header">
          <div style="display:flex; flex-direction:column; gap:0.25rem;">
            <h1 style="font-size:1.75rem; font-weight:800; display:flex; align-items:center; gap:0.5rem;">
              ระบบจัดการหลังร้าน <span>POS Portal</span>
            </h1>
            <p style="color:var(--text-muted); font-size:0.9rem;">ควบคุมรายการคำสั่งซื้อของร้านอาหารและจัดการฐานข้อมูลเมนู</p>
          </div>
          
          <div style="display:flex; align-items:center; gap:1rem;">
            <div class="employee-badge">
              <span>👤</span>
              <strong>${session.name}</strong> 
              <span style="font-size:0.75rem; padding:0.1rem 0.4rem; background-color:var(--primary-light); color:var(--primary-dark); border-radius:4px; font-weight:700;">
                ${session.role === 'manager' ? 'ผู้จัดการ' : 'พนักงาน'}
              </span>
            </div>
            <button class="logout-btn" id="btn-employee-logout">
              ออกจากระบบ
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Tab Selection Toolbar -->
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:1rem;">
          <div class="admin-tabs" id="admin-view-tabs">
            <button class="admin-tab-btn ${currentTab === 'orders' ? 'active' : ''}" data-tab="orders">กระดานคำสั่งซื้อ (Orders)</button>
            ${session.role === 'manager' ? `
              <button class="admin-tab-btn ${currentTab === 'history' ? 'active' : ''}" data-tab="history">ประวัติออเดอร์ (History)</button>
              <button class="admin-tab-btn ${currentTab === 'menu' ? 'active' : ''}" data-tab="menu">จัดการเมนู (Menu)</button>
              <button class="admin-tab-btn ${currentTab === 'employees' ? 'active' : ''}" data-tab="employees">จัดการพนักงาน (Staff)</button>
              <button class="admin-tab-btn ${currentTab === 'reports' ? 'active' : ''}" data-tab="reports">รายงานยอดขาย (Reports)</button>
            ` : ''}
          </div>
        </div>

        <!-- Dynamic Dashboard Content -->
        <div id="admin-tab-content">
          <!-- Active Tab content will render here -->
        </div>
      </div>
    `;

    // Render current active tab content
    const renderTabContent = (tab) => {
      if (tab === 'orders') {
        this.renderOrdersBoard(actions);
      } else if (tab === 'history' && session.role === 'manager') {
        this.renderOrderHistory(actions);
      } else if (tab === 'menu' && session.role === 'manager') {
        this.renderMenuManagement(session, actions);
      } else if (tab === 'employees' && session.role === 'manager') {
        this.renderEmployeesManagement(actions);
      } else if (tab === 'reports' && session.role === 'manager') {
        this.renderReports(actions);
      } else {
        this.renderOrdersBoard(actions);
      }
    };

    renderTabContent(currentTab);

    // Bind common header events
    document.getElementById("btn-employee-logout").addEventListener("click", () => {
      DB.logout();
      actions.showToast("ออกจากระบบพนักงานเรียบร้อยแล้ว", 'info');
    });

    const tabContainer = document.getElementById("admin-view-tabs");
    if (tabContainer) {
      tabContainer.addEventListener("click", (e) => {
        const tabBtn = e.target.closest(".admin-tab-btn");
        if (!tabBtn) return;
        
        tabContainer.querySelectorAll(".admin-tab-btn").forEach(btn => btn.classList.remove("active"));
        tabBtn.classList.add("active");
        
        const selectedTab = tabBtn.dataset.tab;
        globalState.adminTab = selectedTab;
        renderTabContent(selectedTab);
      });
    }
  },

  // --- KANBAN ORDERS BOARD ---
  renderOrdersBoard(actions) {
    const contentDiv = document.getElementById("admin-tab-content");
    if (!contentDiv) return;

    const orders = DB.getOrders();
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const cookingOrders = orders.filter(o => o.status === 'cooking');
    const readyOrders = orders.filter(o => o.status === 'ready');
    const completedOrders = orders.filter(o => o.status === 'completed');

    contentDiv.innerHTML = `
      <div class="orders-board">
        <!-- PENDING COLUMN -->
        <div class="board-col">
          <div class="board-col-header">
            <div class="board-col-title">
              <span class="board-col-dot dot-pending"></span>
              รอดำเนินการ (Pending)
            </div>
            <span class="board-col-count">${pendingOrders.length}</span>
          </div>
          <div class="board-col-list" id="col-pending">
            ${this.buildOrderCardsHtml(pendingOrders, 'pending')}
          </div>
        </div>

        <!-- COOKING COLUMN -->
        <div class="board-col">
          <div class="board-col-header">
            <div class="board-col-title">
              <span class="board-col-dot dot-cooking"></span>
              กำลังปรุง (Cooking)
            </div>
            <span class="board-col-count">${cookingOrders.length}</span>
          </div>
          <div class="board-col-list" id="col-cooking">
            ${this.buildOrderCardsHtml(cookingOrders, 'cooking')}
          </div>
        </div>

        <!-- READY COLUMN -->
        <div class="board-col">
          <div class="board-col-header">
            <div class="board-col-title">
              <span class="board-col-dot dot-ready"></span>
              พร้อมเสิร์ฟ (Ready)
            </div>
            <span class="board-col-count">${readyOrders.length}</span>
          </div>
          <div class="board-col-list" id="col-ready">
            ${this.buildOrderCardsHtml(readyOrders, 'ready')}
          </div>
        </div>

        <!-- COMPLETED COLUMN -->
        <div class="board-col">
          <div class="board-col-header">
            <div class="board-col-title">
              <span class="board-col-dot dot-completed"></span>
              เสร็จสิ้น (Completed)
            </div>
            <span class="board-col-count">${completedOrders.length}</span>
          </div>
          <div class="board-col-list" id="col-completed">
            ${this.buildOrderCardsHtml(completedOrders, 'completed')}
          </div>
        </div>
      </div>
    `;

    this.bindOrderActions(actions);
  },

  buildOrderCardsHtml(orders, status) {
    if (orders.length === 0) {
      return `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:120px; color:var(--text-light); text-align:center; font-size:0.8rem; border:2px dashed var(--border-color); border-radius:var(--radius-md);">
          ไม่มีออเดอร์
        </div>
      `;
    }

    return orders.map(order => {
      const timeStr = new Date(order.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      
      let actionButtons = '';
      if (status === 'pending') {
        actionButtons = `
          <button class="order-action-btn action-btn-cooking btn-order-next" data-id="${order.id}" data-next="cooking">
            🍳 รับออเดอร์
          </button>
        `;
      } else if (status === 'cooking') {
        actionButtons = `
          <button class="order-action-btn action-btn-ready btn-order-next" data-id="${order.id}" data-next="ready">
            🛎️ ปรุงเสร็จแล้ว
          </button>
        `;
      } else if (status === 'ready') {
        actionButtons = `
          <button class="order-action-btn action-btn-receipt btn-order-bill" data-id="${order.id}">
            📄 ดูบิล
          </button>
          <button class="order-action-btn action-btn-complete btn-order-next" data-id="${order.id}" data-next="completed">
            ✔️ เช็คบิล/เสร็จสิ้น
          </button>
        `;
      } else if (status === 'completed') {
        actionButtons = `
          <button class="order-action-btn action-btn-receipt btn-order-bill" data-id="${order.id}">
            📄 พิมพ์ใบเสร็จซ้ำ
          </button>
        `;
      }

      return `
        <div class="order-card" data-id="${order.id}">
          <div class="order-card-header">
            <span class="order-card-id">${order.id}</span>
            <span class="order-card-time">${timeStr} น.</span>
          </div>
          <div class="order-card-customer">📌 ${order.customerName}</div>
          <div class="order-card-items">
            ${order.items.map(item => `
              <div class="order-card-item">
                <span><span class="order-card-item-qty">x${item.quantity}</span> ${item.name}</span>
              </div>
            `).join('')}
          </div>
          <div class="order-card-footer">
            <span class="order-card-total">ยอดรวม: <span>${order.total.toFixed(2)} ฿</span></span>
          </div>
          <div class="order-card-actions">
            ${actionButtons}
          </div>
        </div>
      `;
    }).join('');
  },

  bindOrderActions(actions) {
    const contentDiv = document.getElementById("admin-tab-content");
    if (!contentDiv) return;

    contentDiv.addEventListener("click", (e) => {
      // Transition Status
      const nextBtn = e.target.closest(".btn-order-next");
      if (nextBtn) {
        const orderId = nextBtn.dataset.id;
        const nextStatus = nextBtn.dataset.next;
        DB.updateOrderStatus(orderId, nextStatus);
        
        let msg = '';
        if (nextStatus === 'cooking') msg = `เริ่มเตรียมออเดอร์ ${orderId}`;
        else if (nextStatus === 'ready') msg = `ออเดอร์ ${orderId} ปรุงเสร็จพร้อมเสิร์ฟ!`;
        else if (nextStatus === 'completed') msg = `ออเดอร์ ${orderId} ดำเนินการชำระเงินเสร็จสิ้น`;
        
        actions.showToast(msg, 'success');
        this.renderOrdersBoard(actions);
        return;
      }

      // Show Receipt / Bill Modal
      const billBtn = e.target.closest(".btn-order-bill");
      if (billBtn) {
        const orderId = billBtn.dataset.id;
        const orders = DB.getOrders();
        const order = orders.find(o => o.id === orderId);
        if (order) {
          this.showReceiptModal(order);
        }
      }
    });
  },

  // --- RECEIPT PRINTER SIMULATION MODAL ---
  showReceiptModal(order) {
    const session = DB.getCurrentSession();
    const cashierName = session ? session.name : "พนักงานแคชเชียร์";
    const dateStr = new Date(order.createdAt).toLocaleDateString('th-TH') + ' ' + new Date(order.createdAt).toLocaleTimeString('th-TH');

    const modalDiv = document.createElement("div");
    modalDiv.className = "modal-overlay";
    modalDiv.id = "receipt-modal";
    
    // Receipt HTML block
    const receiptHtml = `
      <div class="receipt-paper">
        <div class="receipt-header">
          <div class="receipt-shop">🍲 Aroy-Dee Restaurant</div>
          <div style="font-size: 11px; margin-top: 3px;">สาขาที่ 001 - สาขาเอกมัย (Repository 681894005)</div>
          <div style="font-size: 11px;">โทร: 02-123-4567</div>
        </div>
        <div class="receipt-divider"></div>
        <div class="receipt-info-row">
          <span>บิลขายเลขที่:</span>
          <span>${order.id}</span>
        </div>
        <div class="receipt-info-row">
          <span>วันที่สั่ง:</span>
          <span>${dateStr}</span>
        </div>
        <div class="receipt-info-row">
          <span>โต๊ะลูกค้า:</span>
          <span>${order.customerName}</span>
        </div>
        <div class="receipt-info-row">
          <span>พนักงานขาย:</span>
          <span>${cashierName}</span>
        </div>
        <div class="receipt-divider"></div>
        <div class="receipt-items">
          ${order.items.map(item => `
            <div class="receipt-item-row">
              <div class="receipt-item-name-col">${item.name} <br> <span style="font-size:11px; color:#555;">${item.quantity} x ${item.price} ฿</span></div>
              <div class="receipt-item-price-col">${(item.quantity * item.price).toFixed(2)} ฿</div>
            </div>
          `).join('')}
        </div>
        <div class="receipt-divider"></div>
        <div class="receipt-totals">
          <div class="receipt-total-row">
            <span>ค่าอาหาร (Subtotal)</span>
            <span>${order.subtotal.toFixed(2)} ฿</span>
          </div>
          <div class="receipt-total-row">
            <span>ภาษีมูลค่าเพิ่ม (VAT 7%)</span>
            <span>${order.vat.toFixed(2)} ฿</span>
          </div>
          <div class="receipt-divider"></div>
          <div class="receipt-total-row grand">
            <span>ยอดชำระเงินทั้งสิ้น (NET)</span>
            <span>${order.total.toFixed(2)} ฿</span>
          </div>
        </div>
        <div class="receipt-divider"></div>
        <div style="text-align:center; font-size:10px; margin: 10px 0 5px 0; font-family: 'Courier New'; font-weight: bold; border: 1px solid #000; padding: 4px; letter-spacing: 2px;">
          ||||| *${order.id}* |||||
        </div>
        <div class="receipt-footer">
          <p>ขอขอบคุณที่ใช้บริการอร่อยดี</p>
          <p>อาหารปรุงร้อน สะอาด ถูกสุขลักษณะ</p>
          <p>-- ใบเสร็จจำลองสำหรับทดสอบระบบ --</p>
        </div>
      </div>
    `;

    modalDiv.innerHTML = `
      <div class="modal-content" style="max-width: 400px;">
        <div class="modal-header">
          <h3 class="modal-title">จำลองบิลชำระเงิน</h3>
          <button class="modal-close-btn" id="btn-close-receipt">×</button>
        </div>
        <div class="modal-body" style="background-color:#0d1321; padding: 1.5rem 1rem;">
          ${receiptHtml}
        </div>
        <div class="modal-footer" style="justify-content:space-between;">
          <button class="modal-btn cancel" id="btn-close-receipt-foot">ปิด</button>
          <button class="modal-btn confirm" id="btn-trigger-print" style="display:flex; align-items:center; gap:0.35rem;">
            🖨️ สั่งพิมพ์ใบเสร็จ (Print)
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modalDiv);

    // Close logic
    const closeModal = () => modalDiv.remove();
    modalDiv.querySelector("#btn-close-receipt").addEventListener("click", closeModal);
    modalDiv.querySelector("#btn-close-receipt-foot").addEventListener("click", closeModal);
    
    // Print Logic Integration
    modalDiv.querySelector("#btn-trigger-print").addEventListener("click", () => {
      // Inject print block into the dedicated print section of index.html
      const printSec = document.getElementById("print-section");
      if (printSec) {
        printSec.innerHTML = receiptHtml;
        window.print();
        printSec.innerHTML = ""; // Clear after printing dialog closes
      }
    });
  },

  // --- MENU MANAGEMENT TAB ---
  renderMenuManagement(session, actions) {
    const contentDiv = document.getElementById("admin-tab-content");
    if (!contentDiv) return;

    const isManager = session.role === 'manager';
    const menuItems = DB.getMenu();

    contentDiv.innerHTML = `
      <div class="menu-manage-section">
        <div class="menu-manage-toolbar">
          <h2 style="font-size:1.25rem; font-family:var(--font-display); font-weight:700;">รายการอาหารที่มีทั้งหมด (${menuItems.length} เมนู)</h2>
          ${isManager 
            ? `<button class="add-menu-btn" id="btn-open-add-menu-modal">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                เพิ่มเมนูใหม่
               </button>`
            : `<div style="font-size:0.85rem; color:var(--text-muted); padding:0.4rem 0.8rem; background-color:#1e293b; border-radius:4px; border:1px solid var(--border-color);">
                🔒 เฉพาะสิทธิ์ผู้จัดการเท่านั้นที่สามารถ เพิ่ม/แก้ไข เมนูได้
               </div>`
          }
        </div>

        <div class="menu-table-container">
          <table class="menu-table">
            <thead>
              <tr>
                <th>เมนูอาหาร</th>
                <th>ราคา</th>
                <th>หมวดหมู่</th>
                <th>สถานะวัตถุดิบ</th>
                ${isManager ? '<th style="text-align:right;">จัดการ</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${menuItems.map(item => `
                <tr data-id="${item.id}">
                  <td>
                    <div class="table-dish">
                      <img src="${item.image}" alt="${item.name}" class="table-dish-img" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2250%22><rect width=%22100%%22 height=%22100%%22 fill=%22%231e293b%22/><text x=%2250%%22 y=%2260%%22 font-size=%2222%22 text-anchor=%22middle%22>🍛</text></svg>'">
                      <div class="table-dish-info">
                        <span class="table-dish-name">${item.name}</span>
                        <span class="table-dish-desc">${item.description || 'ไม่มีรายละเอียด'}</span>
                      </div>
                    </div>
                  </td>
                  <td style="font-weight:700; font-family:var(--font-display); font-size:1.05rem;">${item.price} ฿</td>
                  <td>
                    <span style="font-size:0.8rem; font-weight:600; padding:0.25rem 0.6rem; border-radius:9999px; background-color:var(--bg-light); border:1px solid var(--border-color);">
                      ${item.category}
                    </span>
                  </td>
                  <td>
                    ${isManager 
                      ? `<button class="status-indicator btn-toggle-avail ${item.available ? 'available' : 'unavailable'}" data-id="${item.id}" data-val="${item.available}">
                          ${item.available ? '🟢 พร้อมจำหน่าย' : '🔴 หมดชั่วคราว'}
                         </button>`
                      : `<span class="status-indicator ${item.available ? 'available' : 'unavailable'}">
                          ${item.available ? '🟢 พร้อมจำหน่าย' : '🔴 หมดชั่วคราว'}
                         </span>`
                    }
                  </td>
                  ${isManager 
                    ? `<td style="text-align:right;">
                        <div class="table-actions" style="justify-content:flex-end;">
                          <button class="table-action-btn edit btn-edit-menu" data-id="${item.id}" title="แก้ไขเมนู">
                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button class="table-action-btn delete btn-delete-menu" data-id="${item.id}" title="ลบเมนู">
                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                       </td>`
                    : ''
                  }
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.bindMenuManagerEvents(session, actions);
  },

  bindMenuManagerEvents(session, actions) {
    const isManager = session.role === 'manager';
    if (!isManager) return;

    const contentDiv = document.getElementById("admin-tab-content");
    if (!contentDiv) return;

    // Open add modal
    const addBtn = document.getElementById("btn-open-add-menu-modal");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        this.showMenuEditModal(null, actions);
      });
    }

    // Table action buttons (Edit, Delete, Toggle Availability)
    contentDiv.addEventListener("click", (e) => {
      // Toggle Availability
      const availBtn = e.target.closest(".btn-toggle-avail");
      if (availBtn) {
        const id = availBtn.dataset.id;
        const currentVal = availBtn.dataset.val === "true";
        DB.updateMenuItem(id, { available: !currentVal });
        actions.showToast("อัปเดตสถานะจำหน่ายอาหารเรียบร้อยแล้ว", 'info');
        this.renderMenuManagement(session, actions);
        return;
      }

      // Edit MenuItem
      const editBtn = e.target.closest(".btn-edit-menu");
      if (editBtn) {
        const id = editBtn.dataset.id;
        const item = DB.getMenu().find(i => i.id === id);
        if (item) {
          this.showMenuEditModal(item, actions);
        }
        return;
      }

      // Delete MenuItem
      const deleteBtn = e.target.closest(".btn-delete-menu");
      if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        const item = DB.getMenu().find(i => i.id === id);
        if (item) {
          if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบเมนู "${item.name}"?`)) {
            DB.deleteMenuItem(id);
            actions.showToast(`ลบเมนูอาหาร ${item.name} สำเร็จ`, 'warning');
            this.renderMenuManagement(session, actions);
          }
        }
      }
    });
  },

  // --- CRUD DISH EDIT/CREATE MODAL ---
  showMenuEditModal(item, actions) {
    const isEdit = !!item;
    const modalDiv = document.createElement("div");
    modalDiv.className = "modal-overlay";
    modalDiv.id = "menu-edit-modal";
    
    const categories = ['Main', 'Dessert', 'Drinks'];

    modalDiv.innerHTML = `
      <div class="modal-content" style="max-width: 480px;">
        <div class="modal-header">
          <h3 class="modal-title">${isEdit ? 'แก้ไขข้อมูลเมนูอาหาร' : 'เพิ่มเมนูอาหารใหม่'}</h3>
          <button class="modal-close-btn" id="btn-close-menu-modal">×</button>
        </div>
        <form id="menu-edit-form">
          <div class="modal-body" style="display:flex; flex-direction:column; gap:1rem;">
            <div class="input-group">
              <label for="edit-name">ชื่อเมนู (ทั้งภาษาไทยและอังกฤษ)</label>
              <input type="text" id="edit-name" class="form-input" value="${isEdit ? item.name : ''}" required placeholder="ตัวอย่าง: ผัดกะเพราไข่ดาว (Pad Kra Prow)">
            </div>
            
            <div class="input-group">
              <label for="edit-price">ราคา (บาท)</label>
              <input type="number" id="edit-price" class="form-input" value="${isEdit ? item.price : ''}" required min="0" placeholder="0">
            </div>

            <div class="input-group">
              <label for="edit-category">หมวดหมู่อาหาร</label>
              <select id="edit-category" class="form-input" style="background-color: #0f172a;" required>
                ${categories.map(cat => `<option value="${cat}" ${isEdit && item.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
              </select>
            </div>

            <div class="input-group">
              <label for="edit-image">URL รูปภาพอาหาร</label>
              <input type="text" id="edit-image" class="form-input" value="${isEdit ? item.image : ''}" placeholder="./assets/images/custom_dish.jpg">
            </div>

            <div class="input-group">
              <label for="edit-description">คำอธิบายรายละเอียดอาหาร</label>
              <textarea id="edit-description" class="form-input" style="resize:vertical; min-height:80px;" placeholder="ส่วนผสมหลัก รสชาติ เสิร์ฟอย่างไร...">${isEdit ? (item.description || '') : ''}</textarea>
            </div>

            <div class="input-group" style="flex-direction:row; align-items:center; gap:0.5rem; margin-top:0.5rem;">
              <input type="checkbox" id="edit-available" ${!isEdit || item.available ? 'checked' : ''} style="width:18px; height:18px;">
              <label for="edit-available" style="cursor:pointer; user-select:none;">พร้อมจำหน่ายทันที</label>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="modal-btn cancel" id="btn-cancel-menu-modal">ยกเลิก</button>
            <button type="submit" class="modal-btn confirm">บันทึกข้อมูล</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modalDiv);

    // Close logic
    const closeModal = () => modalDiv.remove();
    modalDiv.querySelector("#btn-close-menu-modal").addEventListener("click", closeModal);
    modalDiv.querySelector("#btn-cancel-menu-modal").addEventListener("click", closeModal);

    // Submit logic
    const form = modalDiv.querySelector("#menu-edit-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const name = document.getElementById("edit-name").value.trim();
      const price = parseFloat(document.getElementById("edit-price").value) || 0;
      const category = document.getElementById("edit-category").value;
      let image = document.getElementById("edit-image").value.trim();
      const description = document.getElementById("edit-description").value.trim();
      const available = document.getElementById("edit-available").checked;

      // Default fallback images path if blank
      if (!image) {
        if (category === 'Main') image = './assets/images/pad_thai.jpg';
        else if (category === 'Dessert') image = './assets/images/mango_sticky_rice.jpg';
        else image = './assets/images/thai_tea.jpg';
      }

      const itemData = { name, price, category, image, description, available };

      if (isEdit) {
        DB.updateMenuItem(item.id, itemData);
        actions.showToast(`แก้ไขเมนู "${name}" เรียบร้อยแล้ว`, 'success');
      } else {
        DB.addMenuItem(itemData);
        actions.showToast(`เพิ่มเมนู "${name}" เข้าสู่ระบบเรียบร้อยแล้ว`, 'success');
      }

      closeModal();
      
      // Refresh current menu view tab
      const session = DB.getCurrentSession();
      this.renderMenuManagement(session, actions);
    });
  },

  renderReports(actions) {
    const contentDiv = document.getElementById("admin-tab-content");
    if (!contentDiv) return;

    const orders = DB.getOrders();
    const completedOrders = orders.filter(o => o.status === 'completed');
    
    // Calculations
    const totalSales = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrdersCount = orders.length;
    const avgOrderValue = totalOrdersCount > 0 ? (totalSales / completedOrders.length || 0) : 0;
    
    // Count popular items
    const itemCounts = {};
    completedOrders.forEach(o => {
      o.items.forEach(item => {
        if (!itemCounts[item.name]) {
          itemCounts[item.name] = { count: 0, revenue: 0 };
        }
        itemCounts[item.name].count += item.quantity;
        itemCounts[item.name].revenue += (item.price * item.quantity);
      });
    });
    
    const popularItems = Object.keys(itemCounts).map(name => ({
      name,
      count: itemCounts[name].count,
      revenue: itemCounts[name].revenue
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    contentDiv.innerHTML = `
      <div class="reports-container" style="display:flex; flex-direction:column; gap:1.5rem; color:var(--text-light);">
        <!-- Summary Stats Cards -->
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:1rem;">
          <div style="background:var(--bg-light); border:1px solid var(--border-color); padding:1.25rem; border-radius:8px;">
            <div style="font-size:0.85rem; color:var(--text-muted); font-weight:600; margin-bottom:0.5rem;">ยอดขายรวม (Total Revenue)</div>
            <div style="font-size:1.75rem; font-weight:800; color:var(--primary-color);">${totalSales.toLocaleString()} ฿</div>
          </div>
          <div style="background:var(--bg-light); border:1px solid var(--border-color); padding:1.25rem; border-radius:8px;">
            <div style="font-size:0.85rem; color:var(--text-muted); font-weight:600; margin-bottom:0.5rem;">ออเดอร์ทั้งหมด (Total Orders)</div>
            <div style="font-size:1.75rem; font-weight:800;">${totalOrdersCount} บิล</div>
          </div>
          <div style="background:var(--bg-light); border:1px solid var(--border-color); padding:1.25rem; border-radius:8px;">
            <div style="font-size:0.85rem; color:var(--text-muted); font-weight:600; margin-bottom:0.5rem;">เฉลี่ยต่อบิล (Avg. Bill Value)</div>
            <div style="font-size:1.75rem; font-weight:800; color:var(--accent-color);">${avgOrderValue.toFixed(2)} ฿</div>
          </div>
        </div>

        <!-- Popular Menu Items -->
        <div style="background:var(--bg-light); border:1px solid var(--border-color); padding:1.5rem; border-radius:8px;">
          <h3 style="font-size:1.1rem; font-weight:700; margin-bottom:1rem; border-bottom:1px solid var(--border-color); padding-bottom:0.5rem;">🔥 เมนูขายดีที่สุด (Best Selling Items)</h3>
          ${popularItems.length === 0 
            ? '<p style="color:var(--text-muted); text-align:center; padding:1.5rem;">ยังไม่มีสถิติยอดสั่งซื้อในออเดอร์ที่เสร็จสมบูรณ์</p>'
            : `<div style="display:flex; flex-direction:column; gap:1rem;">
                ${popularItems.map((item, index) => `
                  <div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem; font-size:0.9rem;">
                      <strong>${index+1}. ${item.name}</strong>
                      <span>${item.count} ชิ้น (ยอดขาย ${item.revenue.toLocaleString()} ฿)</span>
                    </div>
                    <div style="background:var(--border-color); height:8px; border-radius:4px; overflow:hidden;">
                      <div style="background:var(--primary-color); width:${(item.count / popularItems[0].count) * 100}%; height:100%;"></div>
                    </div>
                  </div>
                `).join('')}
              </div>`
          }
        </div>
      </div>
    `;
  },

  renderEmployeesManagement(actions) {
    const contentDiv = document.getElementById("admin-tab-content");
    if (!contentDiv) return;

    const employees = DB.getEmployees();

    contentDiv.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1rem; color:var(--text-light);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3 style="font-size:1.1rem; font-weight:700;">👤 รายชื่อบัญชีพนักงานในระบบ</h3>
          <button class="add-menu-btn" id="btn-add-employee" style="padding:0.4rem 0.8rem; font-size:0.85rem;">
            + เพิ่มบัญชีพนักงาน
          </button>
        </div>

        <div style="overflow-x:auto; background:var(--bg-light); border:1px solid var(--border-color); border-radius:8px;">
          <table style="width:100%; border-collapse:collapse; font-size:0.9rem; text-align:left;">
            <thead>
              <tr style="border-bottom:1px solid var(--border-color); background:rgba(255,255,255,0.02);">
                <th style="padding:0.75rem 1rem;">ชื่อพนักงาน (Name)</th>
                <th style="padding:0.75rem 1rem;">ชื่อผู้ใช้ (Username)</th>
                <th style="padding:0.75rem 1rem;">รหัสผ่าน (Password)</th>
                <th style="padding:0.75rem 1rem;">สิทธิ์ (Role)</th>
                <th style="padding:0.75rem 1rem; text-align:center;">การกระทำ (Actions)</th>
              </tr>
            </thead>
            <tbody>
              ${employees.map(emp => `
                <tr style="border-bottom:1px solid var(--border-color);">
                  <td style="padding:0.75rem 1rem; font-weight:600;">${emp.name}</td>
                  <td style="padding:0.75rem 1rem;"><code>${emp.username}</code></td>
                  <td style="padding:0.75rem 1rem; color:var(--text-muted); font-size:0.8rem;">${emp.username}123</td>
                  <td style="padding:0.75rem 1rem;">
                    <span style="font-size:0.75rem; padding:0.15rem 0.4rem; border-radius:4px; font-weight:700; ${
                      emp.role === 'manager' 
                        ? 'background:rgba(239,68,68,0.1); color:#ef4444;' 
                        : 'background:rgba(16,185,129,0.1); color:#10b981;'
                    }">
                      ${emp.role === 'manager' ? 'ผู้จัดการ' : 'พนักงานครัว'}
                    </span>
                  </td>
                  <td style="padding:0.75rem 1rem; text-align:center;">
                    <button class="delete-menu-item-btn" data-username="${emp.username}" style="padding:0.25rem 0.5rem; font-size:0.75rem; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2); color:#ef4444; border-radius:4px; cursor:pointer;">
                      ลบ
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Bind add button
    document.getElementById("btn-add-employee").addEventListener("click", () => {
      this.showEmployeeModal(null, actions);
    });

    // Bind delete buttons
    contentDiv.querySelectorAll(".delete-menu-item-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const username = e.target.dataset.username;
        if (confirm(`คุณต้องการลบพนักงาน "${username}" ใช่หรือไม่?`)) {
          const res = DB.deleteEmployee(username);
          if (res.success) {
            actions.showToast("ลบบัญชีพนักงานเรียบร้อย", "success");
            this.renderEmployeesManagement(actions);
          } else {
            actions.showToast(res.message, "danger");
          }
        }
      });
    });
  },

  showEmployeeModal(employee, actions) {
    const modalDiv = document.createElement("div");
    modalDiv.className = "modal-overlay";
    modalDiv.id = "employee-modal";
    modalDiv.innerHTML = `
      <div class="modal-content" style="max-width: 400px; color:var(--text-light);">
        <div class="modal-header">
          <h2>+ เพิ่มบัญชีพนักงานใหม่</h2>
          <button id="btn-close-emp-modal" class="modal-close">&times;</button>
        </div>
        <form id="emp-edit-form" style="padding:1rem 0; display:flex; flex-direction:column; gap:1rem;">
          <div class="input-group">
            <label style="font-size:0.85rem; margin-bottom:0.25rem; font-weight:600;">ชื่อพนักงาน</label>
            <input type="text" id="emp-name" class="form-input" placeholder="เช่น คุณสมศรี..." required>
          </div>
          <div class="input-group">
            <label style="font-size:0.85rem; margin-bottom:0.25rem; font-weight:600;">ชื่อผู้ใช้งาน (Username)</label>
            <input type="text" id="emp-username" class="form-input" placeholder="เช่น somsri..." required>
            <span style="font-size:0.7rem; color:var(--text-muted); margin-top:0.25rem;">รหัสผ่านเริ่มต้นของระบบจะเป็น: ชื่อผู้ใช้งาน + "123"</span>
          </div>
          <div class="input-group">
            <label style="font-size:0.85rem; margin-bottom:0.25rem; font-weight:600;">สิทธิ์ตำแหน่งพนักงาน</label>
            <select id="emp-role" class="form-input" style="background:var(--bg-dark); color:var(--text-light); border:1px solid var(--border-color);">
              <option value="staff">พนักงานครัว (Kitchen Staff)</option>
              <option value="manager">ผู้จัดการ (Manager)</option>
            </select>
          </div>
          <div class="modal-footer" style="margin-top:1rem; display:flex; gap:0.5rem; justify-content:flex-end;">
            <button type="button" id="btn-cancel-emp-modal" class="btn-secondary" style="padding:0.4rem 0.8rem; font-size:0.85rem;">ยกเลิก</button>
            <button type="submit" class="btn-primary" style="padding:0.4rem 0.8rem; font-size:0.85rem;">บันทึกข้อมูล</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modalDiv);

    const closeModal = () => modalDiv.remove();
    document.getElementById("btn-close-emp-modal").addEventListener("click", closeModal);
    document.getElementById("btn-cancel-emp-modal").addEventListener("click", closeModal);

    modalDiv.querySelector("#emp-edit-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("emp-name").value.trim();
      const username = document.getElementById("emp-username").value.trim().toLowerCase();
      const role = document.getElementById("emp-role").value;

      const res = DB.addEmployee({ name, username, role });
      if (res.success) {
        actions.showToast(`เพิ่มพนักงานคุณ ${name} เข้าสู่ระบบสำเร็จแล้ว`, "success");
        closeModal();
        this.renderEmployeesManagement(actions);
      } else {
        actions.showToast(res.message, "danger");
      }
    });
  },

  renderOrderHistory(actions) {
    const contentDiv = document.getElementById("admin-tab-content");
    if (!contentDiv) return;

    const orders = DB.getOrders();

    const renderList = (filteredOrders) => {
      let tbodyHtml = '';
      if (filteredOrders.length === 0) {
        tbodyHtml = `
          <tr>
            <td colspan="5" style="padding:2rem; text-align:center; color:var(--text-muted);">ไม่พบข้อมูลออเดอร์ย้อนหลัง</td>
          </tr>
        `;
      } else {
        tbodyHtml = filteredOrders.map(order => {
          let statusText = 'รอดำเนินการ';
          let statusStyle = 'background:rgba(249,115,22,0.1); color:#f97316;';
          if (order.status === 'cooking') {
            statusText = 'กำลังปรุง';
            statusStyle = 'background:rgba(59,130,246,0.1); color:#3b82f6;';
          } else if (order.status === 'ready') {
            statusText = 'พร้อมเสิร์ฟ';
            statusStyle = 'background:rgba(16,185,129,0.1); color:#10b981;';
          } else if (order.status === 'completed') {
            statusText = 'เสร็จสมบูรณ์';
            statusStyle = 'background:rgba(100,116,139,0.1); color:#64748b;';
          }

          const itemsText = order.items.map(i => `${i.name} (${i.quantity}x)`).join(', ');

          return `
            <tr style="border-bottom:1px solid var(--border-color);">
              <td style="padding:0.75rem 1rem; font-weight:600; font-family:monospace;">${order.id}</td>
              <td style="padding:0.75rem 1rem;">${order.customerName}</td>
              <td style="padding:0.75rem 1rem; max-width:250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${itemsText}">${itemsText}</td>
              <td style="padding:0.75rem 1rem; font-weight:600; color:var(--primary-color);">${order.total} ฿</td>
              <td style="padding:0.75rem 1rem;">
                <span style="font-size:0.75rem; padding:0.15rem 0.4rem; border-radius:4px; font-weight:700; ${statusStyle}">
                  ${statusText}
                </span>
              </td>
            </tr>
          `;
        }).join('');
      }

      document.getElementById("history-table-body").innerHTML = tbodyHtml;
    };

    contentDiv.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1rem; color:var(--text-light);">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:1rem; flex-wrap:wrap;">
          <h3 style="font-size:1.1rem; font-weight:700;">📋 ประวัติออเดอร์ในร้านทั้งหมด</h3>
          <input type="text" id="history-search" class="form-input" placeholder="🔍 ค้นหาด้วยเลขออเดอร์ หรือ ชื่อลูกค้า..." style="max-width:300px; font-size:0.85rem; padding:0.4rem 0.8rem;">
        </div>

        <div style="overflow-x:auto; background:var(--bg-light); border:1px solid var(--border-color); border-radius:8px;">
          <table style="width:100%; border-collapse:collapse; font-size:0.9rem; text-align:left;">
            <thead>
              <tr style="border-bottom:1px solid var(--border-color); background:rgba(255,255,255,0.02);">
                <th style="padding:0.75rem 1rem;">รหัสออเดอร์</th>
                <th style="padding:0.75rem 1rem;">ลูกค้า/โต๊ะ</th>
                <th style="padding:0.75rem 1rem;">รายการอาหาร</th>
                <th style="padding:0.75rem 1rem;">ยอดรวม</th>
                <th style="padding:0.75rem 1rem;">สถานะ</th>
              </tr>
            </thead>
            <tbody id="history-table-body">
              <!-- Dynamically rendered rows -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Render initial list
    renderList(orders);

    // Bind search event
    document.getElementById("history-search").addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        renderList(orders);
      } else {
        const filtered = orders.filter(o => 
          o.id.toLowerCase().includes(q) || 
          o.customerName.toLowerCase().includes(q)
        );
        renderList(filtered);
      }
    });
  }
};
