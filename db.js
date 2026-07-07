// db.js - Aroma Cafe Hybrid Database Client (LocalStorage + Supabase Fallback)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const DB_VERSION = "5"; // Incremented to clear previous restaurant cache

const DEFAULT_MENU_ITEMS = [
  {
    id: "c1",
    name: "เอสเพรสโซ่ร้อน (Hot Espresso)",
    price: 50,
    category: "Coffee",
    image: "https://images.unsplash.com/photo-151097252790b-a638d6481a4e?w=600&auto=format&fit=crop&q=60",
    description: "เอสเพรสโซ่เข้มข้น รสชาติตามตำรับกาแฟอิตาเลียนแท้ ช็อตกาแฟสกัดสดใหม่เข้มข้นกลมกล่อม",
    available: true
  },
  {
    id: "c2",
    name: "อเมริกาโน่เย็น (Iced Americano)",
    price: 60,
    category: "Coffee",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=60",
    description: "อเมริกาโน่เย็น ช็อตเอสเปรสโซ่เข้มข้นผสมน้ำดื่มบริสุทธิ์ ดื่มง่าย สดชื่นกระปรี้กระเปร่าตลอดวัน",
    available: true
  },
  {
    id: "c3",
    name: "คาปูชิโน่เย็น (Iced Cappuccino)",
    price: 65,
    category: "Coffee",
    image: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=600&auto=format&fit=crop&q=60",
    description: "คาปูชิโน่เย็นหอมกลมกล่อม ช็อตกาแฟเข้มข้นท็อปด้วยฟองนมหนานุ่มโรยผงโกโก้บางเบาเพิ่มความหอม",
    available: true
  },
  {
    id: "c4",
    name: "ลาเต้ร้อน (Hot Latte)",
    price: 60,
    category: "Coffee",
    image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=60",
    description: "ลาเต้ร้อนสัมผัสนุ่มละมุน ช็อตเอสเปรสโซ่เข้มข้นผสานนมสดสตรีมร้อนและฟองนมนุ่มๆ พร้อมลวดลายลาเต้อาร์ตสวยงาม",
    available: true
  },
  {
    id: "b1",
    name: "ครัวซองต์เนยสด (Butter Croissant)",
    price: 75,
    category: "Bakery",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=60",
    description: "ครัวซองต์เนยสดฝรั่งเศส อบสดใหม่ทุกวัน แป้งบางกรอบนอก นุ่มชุ่มฉ่ำเนยด้านใน หอมกรุ่นจากเตา",
    available: true
  },
  {
    id: "b2",
    name: "เค้กช็อกโกแลตฟัดจ์ (Chocolate Fudge Cake)",
    price: 85,
    category: "Bakery",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=60",
    description: "เค้กช็อกโกแลตฟัดจ์หน้านิ่ม รสชาติช็อกโกแลตเข้มข้น เนื้อเค้กเนียนนุ่ม สลับชั้นด้วยซอสฟัดจ์เยิ้มๆ",
    available: true
  },
  {
    id: "b3",
    name: "บลูเบอร์รี่มัฟฟิน (Blueberry Muffin)",
    price: 70,
    category: "Bakery",
    image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=600&auto=format&fit=crop&q=60",
    description: "บลูเบอร์รี่มัฟฟินอบร้อนชิ้นโต เนื้อนุ่มฟูสอดแทรกด้วยผลบลูเบอร์รี่แท้รสเปรี้ยวอมหวาน โรยหน้าด้วยครัมเบิ้ลกรุบกรอบ",
    available: true
  },
  {
    id: "d1",
    name: "มัทฉะลาเต้เย็น (Iced Matcha Latte)",
    price: 75,
    category: "Other Drinks",
    image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=60",
    description: "มัทฉะลาเต้เย็นสูตรพรีเมียม ผงมัทฉะแท้นำเข้าจากอุจิ ประเทศญี่ปุ่น ชงเข้มข้นเข้ากับนมสดสตรีมเย็นรสหวานกลมกล่อม",
    available: true
  },
  {
    id: "d2",
    name: "ชาไทยเย็นสูตรโบราณ (Thai Iced Tea)",
    price: 60,
    category: "Other Drinks",
    image: "https://images.unsplash.com/photo-1553909489-cd47e0907980?w=600&auto=format&fit=crop&q=60",
    description: "ชาไทยเย็นสูตรดั้งเดิม ใบชาชงสดใหม่ กลิ่นหอมเป็นเอกลักษณ์ รสชาติหวานมัน เข้มข้นตามสไตล์ไทยแท้",
    available: true
  }
];

const DEFAULT_EMPLOYEES = [
  { username: "admin", name: "ผู้จัดการร้าน (Manager)", role: "manager" },
  { username: "staff", name: "พนักงานแคชเชียร์ (Staff)", role: "staff" }
];

const DEFAULT_MEMBERS = [
  { name: "สมชาย มีแต้ม", phone: "0812345678", points: 120, createdAt: new Date().toISOString() },
  { name: "สมหญิง รักกาแฟ", phone: "0898765432", points: 45, createdAt: new Date().toISOString() }
];

// Helper to initialize local storage
function initDB() {
  if (localStorage.getItem("coffee_db_version") !== DB_VERSION) {
    localStorage.removeItem("coffee_menu");
    localStorage.removeItem("coffee_orders");
    localStorage.removeItem("coffee_employees");
    localStorage.removeItem("coffee_members");
    localStorage.setItem("coffee_db_version", DB_VERSION);
  }

  if (!localStorage.getItem("coffee_menu")) {
    localStorage.setItem("coffee_menu", JSON.stringify(DEFAULT_MENU_ITEMS));
  }
  if (!localStorage.getItem("coffee_orders")) {
    localStorage.setItem("coffee_orders", JSON.stringify([]));
  }
  if (!localStorage.getItem("coffee_employees")) {
    localStorage.setItem("coffee_employees", JSON.stringify(DEFAULT_EMPLOYEES));
  }
  if (!localStorage.getItem("coffee_members")) {
    localStorage.setItem("coffee_members", JSON.stringify(DEFAULT_MEMBERS));
  }
}

// Call initialization immediately
initDB();

// --- SUPABASE CLIENT INSTANCE ---
let supabase = null;
let isSupabaseConnected = false;

export function getSupabaseClient() {
  if (supabase) return supabase;
  
  const configStr = localStorage.getItem("coffee_supabase_config");
  if (configStr) {
    try {
      const config = JSON.parse(configStr);
      if (config.url && config.key) {
        supabase = createClient(config.url, config.key);
        isSupabaseConnected = true;
        return supabase;
      }
    } catch (e) {
      console.error("Failed to parse Supabase config:", e);
    }
  }
  isSupabaseConnected = false;
  return null;
}

// Initialize Supabase Client if config is available
getSupabaseClient();

export const DB = {
  // Check Supabase connection state
  async checkSupabaseConnection() {
    const client = getSupabaseClient();
    if (!client) {
      isSupabaseConnected = false;
      return false;
    }
    try {
      const { data, error } = await client.from('coffee_menu').select('id').limit(1);
      if (error) {
        if (error.code === '42P01') {
          console.warn("Supabase is connected, but tables are missing.");
          isSupabaseConnected = true;
          return "tables_missing";
        }
        isSupabaseConnected = false;
        return false;
      }
      isSupabaseConnected = true;
      return true;
    } catch (e) {
      isSupabaseConnected = false;
      return false;
    }
  },

  isSupabaseActive() {
    return isSupabaseConnected && getSupabaseClient() !== null;
  },

  // --- MENU ITEMS (CRUD) ---
  async getMenu() {
    if (this.isSupabaseActive()) {
      try {
        const client = getSupabaseClient();
        const { data, error } = await client.from('coffee_menu').select('*').order('id');
        if (!error && data) {
          localStorage.setItem("coffee_menu", JSON.stringify(data));
          return data;
        }
        console.error("Supabase getMenu error:", error);
      } catch (e) {
        console.error("Supabase getMenu connection error:", e);
      }
    }
    return JSON.parse(localStorage.getItem("coffee_menu")) || [];
  },

  async saveMenuLocal(menu) {
    localStorage.setItem("coffee_menu", JSON.stringify(menu));
    window.dispatchEvent(new CustomEvent("db-menu-updated"));
  },

  async addMenuItem(item) {
    const localMenu = JSON.parse(localStorage.getItem("coffee_menu")) || [];
    const newItem = {
      ...item,
      id: item.id || "m_" + Date.now(),
      price: parseFloat(item.price) || 0,
      available: item.available !== false
    };
    
    localMenu.push(newItem);
    await this.saveMenuLocal(localMenu);

    if (this.isSupabaseActive()) {
      try {
        const client = getSupabaseClient();
        const { error } = await client.from('coffee_menu').insert([newItem]);
        if (error) console.error("Supabase addMenuItem error:", error);
      } catch (e) {
        console.error("Supabase addMenuItem connection error:", e);
      }
    }
    return newItem;
  },

  async updateMenuItem(id, updatedItem) {
    const localMenu = JSON.parse(localStorage.getItem("coffee_menu")) || [];
    const index = localMenu.findIndex(item => item.id === id);
    let updated = null;
    if (index !== -1) {
      localMenu[index] = {
        ...localMenu[index],
        ...updatedItem,
        price: parseFloat(updatedItem.price) || 0
      };
      updated = localMenu[index];
      await this.saveMenuLocal(localMenu);
    }

    if (this.isSupabaseActive() && updated) {
      try {
        const client = getSupabaseClient();
        const { error } = await client.from('coffee_menu').update(updatedItem).eq('id', id);
        if (error) console.error("Supabase updateMenuItem error:", error);
      } catch (e) {
        console.error("Supabase updateMenuItem connection error:", e);
      }
    }
    return updated;
  },

  async deleteMenuItem(id) {
    const localMenu = JSON.parse(localStorage.getItem("coffee_menu")) || [];
    const filtered = localMenu.filter(item => item.id !== id);
    await this.saveMenuLocal(filtered);

    if (this.isSupabaseActive()) {
      try {
        const client = getSupabaseClient();
        const { error } = await client.from('coffee_menu').delete().eq('id', id);
        if (error) console.error("Supabase deleteMenuItem error:", error);
      } catch (e) {
        console.error("Supabase deleteMenuItem connection error:", e);
      }
    }
    return true;
  },

  // --- MEMBERS (LOYALTY SYSTEM) ---
  async getMembers() {
    if (this.isSupabaseActive()) {
      try {
        const client = getSupabaseClient();
        const { data, error } = await client.from('coffee_members').select('*').order('name');
        if (!error && data) {
          localStorage.setItem("coffee_members", JSON.stringify(data));
          return data;
        }
        console.error("Supabase getMembers error:", error);
      } catch (e) {
        console.error("Supabase getMembers connection error:", e);
      }
    }
    return JSON.parse(localStorage.getItem("coffee_members")) || [];
  },

  async findMemberByPhone(phone) {
    const cleanPhone = phone.trim();
    if (this.isSupabaseActive()) {
      try {
        const client = getSupabaseClient();
        const { data, error } = await client.from('coffee_members').select('*').eq('phone', cleanPhone).maybeSingle();
        if (!error && data) return data;
        if (error) console.error("Supabase findMemberByPhone error:", error);
      } catch (e) {
        console.error("Supabase findMemberByPhone connection error:", e);
      }
    }
    
    const members = JSON.parse(localStorage.getItem("coffee_members")) || [];
    return members.find(m => m.phone === cleanPhone) || null;
  },

  async registerMember(name, phone) {
    const cleanPhone = phone.trim();
    const cleanName = name.trim();
    const newMember = {
      name: cleanName,
      phone: cleanPhone,
      points: 0,
      createdAt: new Date().toISOString()
    };

    const members = JSON.parse(localStorage.getItem("coffee_members")) || [];
    if (members.some(m => m.phone === cleanPhone)) {
      return { success: false, message: "เบอร์โทรศัพท์นี้ลงทะเบียนแล้ว" };
    }
    members.push(newMember);
    localStorage.setItem("coffee_members", JSON.stringify(members));

    if (this.isSupabaseActive()) {
      try {
        const client = getSupabaseClient();
        const { error } = await client.from('coffee_members').insert([{
          name: cleanName,
          phone: cleanPhone,
          points: 0
        }]);
        if (error) {
          console.error("Supabase registerMember error:", error);
          if (error.code === '23505') {
            return { success: false, message: "เบอร์โทรศัพท์นี้ลงทะเบียนแล้วในระบบคลาวด์" };
          }
        }
      } catch (e) {
        console.error("Supabase registerMember connection error:", e);
      }
    }
    return { success: true, member: newMember };
  },

  async updateMemberPoints(phone, newPoints) {
    const cleanPhone = phone.trim();
    
    const members = JSON.parse(localStorage.getItem("coffee_members")) || [];
    const index = members.findIndex(m => m.phone === cleanPhone);
    if (index !== -1) {
      members[index].points = newPoints;
      localStorage.setItem("coffee_members", JSON.stringify(members));
    }

    if (this.isSupabaseActive()) {
      try {
        const client = getSupabaseClient();
        const { error } = await client.from('coffee_members').update({ points: newPoints }).eq('phone', cleanPhone);
        if (error) console.error("Supabase updateMemberPoints error:", error);
      } catch (e) {
        console.error("Supabase updateMemberPoints connection error:", e);
      }
    }
  },

  // --- ORDERS ---
  async getOrders() {
    if (this.isSupabaseActive()) {
      try {
        const client = getSupabaseClient();
        const { data, error } = await client.from('coffee_orders').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          const adaptedData = data.map(o => ({
            id: o.id,
            customerName: o.customer_name,
            customerPhone: o.customer_phone,
            items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items,
            subtotal: parseFloat(o.subtotal),
            vat: parseFloat(o.vat),
            total: parseFloat(o.total),
            pointsEarned: o.points_earned,
            pointsRedeemed: o.points_redeemed,
            status: o.status,
            createdAt: o.created_at
          }));
          localStorage.setItem("coffee_orders", JSON.stringify(adaptedData));
          return adaptedData;
        }
        console.error("Supabase getOrders error:", error);
      } catch (e) {
        console.error("Supabase getOrders connection error:", e);
      }
    }
    return JSON.parse(localStorage.getItem("coffee_orders")) || [];
  },

  async saveOrdersLocal(orders) {
    localStorage.setItem("coffee_orders", JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent("db-orders-updated"));
  },

  async createOrder(customerName, items, loyaltyMember = null, redeemDiscount = false) {
    const orders = await this.getOrders();
    
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const vat = parseFloat((subtotal * 0.07).toFixed(2));
    let total = parseFloat((subtotal + vat).toFixed(2));

    const coffeeQuantity = items.reduce((sum, item) => {
      const menu = JSON.parse(localStorage.getItem("coffee_menu")) || [];
      const menuItem = menu.find(mi => mi.id === item.id);
      if (menuItem && menuItem.category === "Coffee") {
        return sum + item.quantity;
      }
      return sum;
    }, 0);
    const pointsEarned = coffeeQuantity * 10;

    let pointsRedeemed = 0;
    if (loyaltyMember && redeemDiscount && loyaltyMember.points >= 100) {
      pointsRedeemed = 100;
      total = Math.max(0, parseFloat((total - 50).toFixed(2)));
    }

    const orderId = "ORD-" + Math.floor(1000 + Math.random() * 9000);
    const newOrder = {
      id: orderId,
      customerName: customerName || "ลูกค้าทั่วไป (Walk-in)",
      customerPhone: loyaltyMember ? loyaltyMember.phone : null,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      subtotal,
      vat,
      total,
      pointsEarned,
      pointsRedeemed,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    orders.unshift(newOrder);
    await this.saveOrdersLocal(orders);

    if (loyaltyMember) {
      const finalPoints = loyaltyMember.points + pointsEarned - pointsRedeemed;
      await this.updateMemberPoints(loyaltyMember.phone, finalPoints);
    }

    if (this.isSupabaseActive()) {
      try {
        const client = getSupabaseClient();
        const { error } = await client.from('coffee_orders').insert([{
          id: newOrder.id,
          customer_name: newOrder.customerName,
          customer_phone: newOrder.customerPhone,
          items: newOrder.items,
          subtotal: newOrder.subtotal,
          vat: newOrder.vat,
          total: newOrder.total,
          points_earned: newOrder.pointsEarned,
          points_redeemed: newOrder.pointsRedeemed,
          status: newOrder.status,
          created_at: newOrder.createdAt
        }]);
        if (error) console.error("Supabase createOrder error:", error);
      } catch (e) {
        console.error("Supabase createOrder connection error:", e);
      }
    }

    return newOrder;
  },

  async updateOrderStatus(orderId, status) {
    const orders = await this.getOrders();
    const index = orders.findIndex(order => order.id === orderId);
    let updated = null;
    if (index !== -1) {
      orders[index].status = status;
      updated = orders[index];
      await this.saveOrdersLocal(orders);
    }

    if (this.isSupabaseActive() && updated) {
      try {
        const client = getSupabaseClient();
        const { error } = await client.from('coffee_orders').update({ status }).eq('id', orderId);
        if (error) console.error("Supabase updateOrderStatus error:", error);
      } catch (e) {
        console.error("Supabase updateOrderStatus connection error:", e);
      }
    }
    return updated;
  },

  // --- AUTHENTICATION ---
  async login(username, password) {
    if (this.isSupabaseActive()) {
      try {
        const client = getSupabaseClient();
        const { data, error } = await client
          .from('coffee_employees')
          .select('*')
          .eq('username', username.trim())
          .eq('password', password)
          .maybeSingle();
        
        if (!error && data) {
          const session = {
            username: data.username,
            name: data.name,
            role: data.role,
            token: "session_" + Math.random().toString(36).substring(2)
          };
          sessionStorage.setItem("coffee_session", JSON.stringify(session));
          window.dispatchEvent(new CustomEvent("auth-changed"));
          return { success: true, session };
        }
        if (error) console.error("Supabase login table error:", error);
      } catch (e) {
        console.error("Supabase login connection error:", e);
      }
    }

    const employees = JSON.parse(localStorage.getItem("coffee_employees")) || DEFAULT_EMPLOYEES;
    const employee = employees.find(emp => emp.username === username);
    
    if (employee && password === username + "123") {
      const session = {
        username: employee.username,
        name: employee.name,
        role: employee.role,
        token: "session_" + Math.random().toString(36).substring(2)
      };
      sessionStorage.setItem("coffee_session", JSON.stringify(session));
      window.dispatchEvent(new CustomEvent("auth-changed"));
      return { success: true, session };
    }
    return { success: false, message: "ชื่อผู้ใช้งาน หรือ รหัสผ่านไม่ถูกต้อง" };
  },

  getCurrentSession() {
    return JSON.parse(sessionStorage.getItem("coffee_session")) || null;
  },

  logout() {
    sessionStorage.removeItem("coffee_session");
    window.dispatchEvent(new CustomEvent("auth-changed"));
  },

  // --- SUPABASE DATA SYNC UTILITIES (PULL & PUSH) ---
  async pushLocalDataToSupabase() {
    if (!this.isSupabaseActive()) return { success: false, message: "Supabase not connected" };
    
    const client = getSupabaseClient();
    try {
      const localMenu = JSON.parse(localStorage.getItem("coffee_menu")) || [];
      for (const item of localMenu) {
        await client.from('coffee_menu').upsert([item]);
      }

      const localMembers = JSON.parse(localStorage.getItem("coffee_members")) || [];
      for (const m of localMembers) {
        await client.from('coffee_members').upsert([{
          name: m.name,
          phone: m.phone,
          points: m.points
        }]);
      }

      const localOrders = JSON.parse(localStorage.getItem("coffee_orders")) || [];
      for (const o of localOrders) {
        await client.from('coffee_orders').upsert([{
          id: o.id,
          customer_name: o.customerName,
          customer_phone: o.customerPhone,
          items: o.items,
          subtotal: o.subtotal,
          vat: o.vat,
          total: o.total,
          points_earned: o.pointsEarned,
          points_redeemed: o.pointsRedeemed,
          status: o.status,
          created_at: o.createdAt
        }]);
      }
      
      return { success: true };
    } catch (e) {
      console.error("Data push sync failed:", e);
      return { success: false, message: e.message };
    }
  }
};
