# 🍲 Aroy-Dee Restaurant Portal & POS System

We have successfully developed a fully responsive, high-fidelity restaurant portal that integrates a **Customer Front-end (ordering & checkout)** and an **Employee POS Back-office (login, order status board, receipt printer, and menu CRUD)**.

---

## 🛠️ Summary of Changes

We created the following core application files in the project workspace:
1. [index.html](file:///c:/Users/DTB02/Documents/681894005/index.html) - Application shell with view routes, Google Fonts, and the printing overlay.
2. [style.css](file:///c:/Users/DTB02/Documents/681894005/style.css) - Global stylesheets containing Light Mode design tokens, card structures, slide-up modal frames, and custom printer page layouts.
3. [db.js](file:///c:/Users/DTB02/Documents/681894005/db.js) - Abstraction layer simulating database actions (users, menus, orders) in browser `localStorage`.
4. [app.js](file:///c:/Users/DTB02/Documents/681894005/app.js) - App controller handling state management, navigation routing, and live page synchronization.
5. [customer.js](file:///c:/Users/DTB02/Documents/681894005/customer.js) - View code for the online menu, cart modifiers, and checkout.
6. [admin.js](file:///c:/Users/DTB02/Documents/681894005/admin.js) - View code for employee logging, order columns, receipt previewing, and dish management.

---

## 📸 Generated Visual Assets

Here is a preview of the premium food image generated and integrated for our **Pad Thai (ผัดไทยกุ้งสด)** dish:

![ผัดไทยกุ้งสดเสิร์ฟพร้อมกุ้งแม่น้ำ](file:///C:/Users/DTB02/.gemini/antigravity/brain/60797445-6c51-48c1-afca-0c4a3302dbbb/pad_thai_1782803927033.jpg)

*Other menu items automatically load modern CSS-styled placeholders featuring culinary emojis (e.g. 🍛, 🥭, 🍹) on soft pastel gradients if actual image files are missing, maintaining a clean and professional layout.*

---

## 🚀 Key Features Implemented

### 1. Customer Ordering Portal
- **Menu Catalog**: Displays dishes with description, categories (Main, Dessert, Drinks), and status.
- **Dynamic Categories**: Instant filtering between food groups with zero lag.
- **Cart Management**: Add items, increase/decrease quantities, or delete items. Badge counter on header and cart tab reflects item count.
- **Interactive Checkout**: Auto-calculates Subtotal, 7% VAT, and Grand Total. Entering table/customer name submits the order into the kitchen queue and displays a success invoice popup.

### 2. POS Back-office Dashboard
- **Security Checkpoints**: Locked employee portal preventing unauthorized modifications.
- **Roles Partition**:
  - **Manager (admin)**: Full rights to update statuses, add new menu items, edit descriptions/prices, toggle availability, and print receipts.
  - **Kitchen Staff (staff)**: View orders and update status (Pending -> Cooking -> Ready -> Completed).
- **Kanban Order Board**: Real-time 4-column flow. When a customer orders, the board instantly adds it.
- **Simulated Slip Printer**: Custom media query `@media print` designed to fit standard 80mm receipt printers. Clicking **Print** triggers the browser's physical print dialog and prints *only* the receipt paper slip.

---

## 🔒 Default Test Credentials

Use these logins to access the employee POS workspace:

| Username | Password | Role | Description |
| :--- | :--- | :--- | :--- |
| `admin` | `admin123` | **Manager** | Full POS rights and CRUD Menu Management. |
| `staff` | `staff123` | **Staff / Chef** | Kitchen order statuses updating only. |

---

## 🌍 How to Deploy and Run

1. **Local Testing**:
   - Because we utilize modern modular JS (`import`/`export`), web browsers restrict loading scripts directly from `file:///` paths due to security rules.
   - To run locally, launch a simple HTTP server (such as VS Code's **Live Server** extension, or run `npx serve .` in the terminal once Node/npm is set up).
2. **Vercel Static Deployment (Recommended)**:
   - This project is 100% compatible with Vercel's zero-config static site hosting.
   - Push these files to your GitHub Repository `681894005`.
   - In Vercel, import the repository and deploy it. It will build and serve your site over HTTPS in seconds. Every time you push an update to GitHub, Vercel will automatically re-deploy the latest version.
