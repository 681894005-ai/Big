// db.js - Mock Database Client using LocalStorage
// Easily replace this implementation with Supabase client or MongoDB Fetch API requests.

const DEFAULT_MENU_ITEMS = [
  {
    id: "m1",
    name: "ผัดไทยกุ้งสด (Pad Thai with Fresh Shrimp)",
    price: 120,
    category: "Main",
    image: "https://images.unsplash.com/photo-1626804475315-9644b37a2fe4?auto=format&fit=crop&w=600&q=80",
    description: "เส้นจันท์เหนียวนุ่ม ผัดกับซอสสูตรพิเศษของร้าน เสิร์ฟพร้อมกุ้งสดตัวโต เต้าหู้ ถั่วงอก และกุยช่าย",
    available: true
  },
  {
    id: "m2",
    name: "ต้มยำกุ้งน้ำข้น (Tom Yum Goong - Thick Soup)",
    price: 180,
    category: "Main",
    image: "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&w=600&q=80",
    description: "ต้มยำรสชาติเข้มข้น หอมเครื่องสมุนไพร ข่า ตะไคร้ ใบมะกรูด พร้อมกุ้งแม่น้ำเนื้อแน่นและเห็ดฟาง",
    available: true
  },
  {
    id: "m3",
    name: "แกงเขียวหวานไก่ (Chicken Green Curry)",
    price: 140,
    category: "Main",
    image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=600&q=80",
    description: "แกงเขียวหวานรสชาติกลมกล่อม หอมกะทิสด ใส่เนื้ออกไก่นุ่ม มะเขือเปราะ และใบโหระพา",
    available: true
  },
  {
    id: "m4",
    name: "ข้าวเหนียวมะม่วง (Mango Sticky Rice)",
    price: 90,
    category: "Dessert",
    image: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=600&q=80",
    description: "มะม่วงน้ำดอกไม้หวานฉ่ำ เสิร์ฟพร้อมข้าวเหนียวมูนราดน้ำกะทิเข้มข้นโรยด้วยถั่วทองกรุบกรอบ",
    available: true
  },
  {
    id: "m5",
    name: "ชาไทยเย็นสูตรโบราณ (Thai Iced Tea)",
    price: 60,
    category: "Drinks",
    image: "https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=600&q=80",
    description: "ชาไทยรสชาติเข้มข้น หวานมันกำลังดี ชงสดใหม่ทุกวัน ท็อปด้วยนมข้นจืดสไตล์ไทยแท้",
    available: true
  },
  {
    id: "m6",
    name: "น้ำดื่มสะอาดแช่เย็น (Fresh Mineral Water)",
    price: 15,
    category: "Drinks",
    image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=600&q=80",
    description: "น้ำแร่ธรรมชาติแช่เย็นชื่นใจ เสิร์ฟพร้อมน้ำแข็งสะอาด",
    available: true
  }
];

const DEFAULT_EMPLOYEES = [
  { username: "admin", name: "ผู้จัดการร้าน (Manager)", role: "manager" },
  { username: "staff", name: "พนักงานครัว (Kitchen Staff)", role: "staff" }
];

// Helper to initialize local storage
function initDB() {
  const DB_VERSION = "4";
  if (localStorage.getItem("restaurant_db_version") !== DB_VERSION) {
    localStorage.removeItem("restaurant_menu");
    localStorage.setItem("restaurant_db_version", DB_VERSION);
  }

  if (!localStorage.getItem("restaurant_menu")) {
    localStorage.setItem("restaurant_menu", JSON.stringify(DEFAULT_MENU_ITEMS));
  }
  if (!localStorage.getItem("restaurant_orders")) {
    localStorage.setItem("restaurant_orders", JSON.stringify([]));
  }
  if (!localStorage.getItem("restaurant_employees")) {
    localStorage.setItem("restaurant_employees", JSON.stringify(DEFAULT_EMPLOYEES));
  }
}

// Call initialization immediately
initDB();

export const DB = {
  // --- MENU ITEMS (CRUD) ---
  getMenu() {
    return JSON.parse(localStorage.getItem("restaurant_menu")) || [];
  },

  saveMenu(menu) {
    localStorage.setItem("restaurant_menu", JSON.stringify(menu));
    // Dispatch custom event to notify other parts of the app in real-time
    window.dispatchEvent(new CustomEvent("db-menu-updated"));
  },

  addMenuItem(item) {
    const menu = this.getMenu();
    const newItem = {
      ...item,
      id: "m_" + Date.now(),
      price: parseFloat(item.price) || 0,
      available: item.available !== false
    };
    menu.push(newItem);
    this.saveMenu(menu);
    return newItem;
  },

  updateMenuItem(id, updatedItem) {
    const menu = this.getMenu();
    const index = menu.findIndex(item => item.id === id);
    if (index !== -1) {
      menu[index] = {
        ...menu[index],
        ...updatedItem,
        price: parseFloat(updatedItem.price) || 0
      };
      this.saveMenu(menu);
      return menu[index];
    }
    return null;
  },

  deleteMenuItem(id) {
    const menu = this.getMenu();
    const filtered = menu.filter(item => item.id !== id);
    this.saveMenu(filtered);
    return true;
  },

  // --- ORDERS ---
  getOrders() {
    return JSON.parse(localStorage.getItem("restaurant_orders")) || [];
  },

  saveOrders(orders) {
    localStorage.setItem("restaurant_orders", JSON.stringify(orders));
    // Dispatch custom event for real-time dashboard updates
    window.dispatchEvent(new CustomEvent("db-orders-updated"));
  },

  createOrder(customerName, items) {
    const orders = this.getOrders();
    
    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const vat = parseFloat((subtotal * 0.07).toFixed(2));
    const total = parseFloat((subtotal + vat).toFixed(2));

    const newOrder = {
      id: "ORD-" + Math.floor(1000 + Math.random() * 9000),
      customerName: customerName || "โต๊ะทั่วไป (Walk-in Table)",
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      subtotal,
      vat,
      total,
      status: "pending", // pending, cooking, ready, completed
      createdAt: new Date().toISOString()
    };

    orders.unshift(newOrder); // Add to the top
    this.saveOrders(orders);
    return newOrder;
  },

  updateOrderStatus(orderId, status) {
    const orders = this.getOrders();
    const index = orders.findIndex(order => order.id === orderId);
    if (index !== -1) {
      orders[index].status = status;
      this.saveOrders(orders);
      return orders[index];
    }
    return null;
  },

  // --- AUTHENTICATION ---
  login(username, password) {
    // Simple password rule: password is username + "123" for this POS system
    const employees = JSON.parse(localStorage.getItem("restaurant_employees")) || DEFAULT_EMPLOYEES;
    const employee = employees.find(emp => emp.username === username);
    
    if (employee && password === username + "123") {
      const session = {
        username: employee.username,
        name: employee.name,
        role: employee.role,
        token: "session_" + Math.random().toString(36).substring(2)
      };
      sessionStorage.setItem("restaurant_session", JSON.stringify(session));
      window.dispatchEvent(new CustomEvent("auth-changed"));
      return { success: true, session };
    }
    return { success: false, message: "ชื่อผู้ใช้งาน หรือ รหัสผ่านไม่ถูกต้อง" };
  },

  getCurrentSession() {
    return JSON.parse(sessionStorage.getItem("restaurant_session")) || null;
  },

  logout() {
    sessionStorage.removeItem("restaurant_session");
    window.dispatchEvent(new CustomEvent("auth-changed"));
  }
};
