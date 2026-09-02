# FarmDirect — Direct Farmer-to-Consumer Digital Mandi (SIH 2026)

**Ministry of Consumer Affairs, Food & Public Distribution — Smart India Hackathon 2026**

FarmDirect eliminates Aadhtiya/Bichauliye middlemen commissions so Indian farmers receive **100% of fair farm-gate prices** and end consumers purchase farm-fresh produce **20–35% cheaper** than APMC Mandi retail prices.

---

## 🌾 Project Structure

```
├── backend/                       # Python Flask REST API Backend (SQLite/PostgreSQL)
│   ├── app.py                     # Flask Application & REST API Endpoints
│   ├── models.py                  # SQLAlchemy ORM Models (User, Product, Order, Review, MandiPriceHistory)
│   ├── seed.py                    # Seeder script (10 Farmers, 3 Consumers, 22 Mandi Crops, 12 Orders, Reviews)
│   └── requirements.txt           # Python dependencies (Flask, Flask-CORS, PyJWT, SQLAlchemy)
│
├── src/                           # Live Full-Stack Application (Next.js App Router + PostgreSQL + Drizzle ORM)
│   ├── app/
│   │   ├── page.tsx               # Landing Page & Mandi Savings Calculator
│   │   ├── marketplace/           # Live Produce Marketplace with Search, Category & Fair-Price Filters
│   │   ├── product/[id]/          # Single Crop Detail + Chart.js 30-Day Agmarknet Price Trend Graph
│   │   ├── farmer/                # Farmer Dashboard, Add Produce Listing, Incoming Orders & Status Manager
│   │   ├── consumer/              # Consumer Dashboard, Order History, Live Order Tracking & Reviews
│   │   ├── admin/                 # Ministry of Consumer Affairs Moderation & Mandi Analytics Panel
│   │   ├── login/ & signup/       # Role-Based Authentication (Farmer / Consumer)
│   │   └── api/                   # REST API routes matching Flask API contract
│   ├── components/
│   │   ├── Navbar.tsx             # Role Navigation + Bilingual English/Hindi (EN/HI) Switcher + Demo Persona Switcher
│   │   ├── MandiPriceChart.tsx    # Chart.js 30-Day APMC Mandi vs FarmDirect Direct Price Trend
│   │   └── FairPriceBadge.tsx     # Govt Fair Price & Middleman Savings Indicator
```

---

## 🔑 Default Demo Login Credentials (Ready for Judges)

| Persona | Role | Phone Number | Password | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Dr. Arvind Swaminathan** | `admin` | `9999999999` | `admin123` | Ministry of Consumer Affairs Admin Panel |
| **Sardar Harbhajan Singh** | `farmer` | `9876543210` | `farmer123` | Taraori Karnal Farmer (Organic Basmati & Wheat) |
| **Balasaheb Deshmukh** | `farmer` | `9876543211` | `farmer123` | Lasalgaon Nashik Farmer (Red Onions & Grapes) |
| **Savita Ben Patel** | `farmer` | `9876543212` | `farmer123` | Anand Dairy Farmer (Gir Cow A2 Desi Milk & Ghee) |
| **Meera Sharma** | `consumer` | `9811111111` | `consumer123` | South Delhi Consumer |
| **Rohan Kulkarni** | `consumer` | `9822222222` | `consumer123` | Mumbai Consumer |

> ⚡ **Hackathon Tip:** Use the **Instant SIH Judge Switcher** bar at the top of the screen to jump between Farmer, Consumer, and Admin dashboards with 1 click!

---

## 🚀 How to Run Locally

### Option 1: Run the Live Fullstack Application (Next.js + PostgreSQL)
```bash
npm install
npx drizzle-kit push
npm run dev
# Open http://localhost:3000
```

### Option 2: Run the Standalone Python Flask Backend (`/backend`)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
# Flask server runs at http://localhost:5000
```
