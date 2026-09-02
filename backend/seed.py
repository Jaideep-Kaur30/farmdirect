import os
from werkzeug.security import generate_password_hash
from models import db, User, Product, Order, Review, MandiPriceHistory


def seed_database(app):
    with app.app_context():
        db.create_all()
        if User.query.count() >= 12:
            print("Database already seeded.")
            return

        print("Seeding FarmDirect SQLite Database for SIH 2026...")

        # 1. Admin
        admin = User(
            name="Dr. Arvind Swaminathan (MoCA Mandi Director)",
            role="admin",
            phone="9999999999",
            password_hash=generate_password_hash("admin123"),
            location="Krishi Bhawan, New Delhi",
            pincode="110001",
            address="Ministry of Consumer Affairs, Krishi Bhawan, Rajpath Area, New Delhi",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        )
        db.session.add(admin)

        # 2. 10 Sample Farmers
        farmers_data = [
            ("Sardar Harbhajan Singh", "9876543210", "Karnal Mandi, Haryana", "132001", "Village Taraori, District Karnal, Haryana"),
            ("Balasaheb Tukaram Deshmukh", "9876543211", "Lasalgaon APMC, Nashik, Maharashtra", "422306", "Niphad Taluka, Nashik District, Maharashtra"),
            ("Savita Ben Patel", "9876543212", "Anand Dairy Cooperative, Gujarat", "388001", "Borsad Village, Anand District, Gujarat"),
            ("Prakash Sawant", "9876543213", "Devgad & Ratnagiri Coast, Maharashtra", "415612", "Pawaskadi Orchard, Ratnagiri, Konkan Belt"),
            ("Ramkhelawan Yadav", "9876543214", "Sonipat Organic Belt, Haryana", "131001", "Murthal Village, Sonipat, NCR Green Belt"),
            ("Thakur Thakurdas Negi", "9876543215", "Kalpa Orchard, Kinnaur, Himachal Pradesh", "172107", "Sangla Valley High Altitude Orchard, Kinnaur"),
            ("Kailash Chand Patidar", "9876543216", "Sehore Mandi, Madhya Pradesh", "466001", "Ashta Tehsil, Sehore District, MP"),
            ("Riluk Nongbri", "9876543217", "Jaintia Hills, Meghalaya", "793150", "Lakadong Village, West Jaintia Hills, Meghalaya"),
            ("Chandrappa Gowda", "9876543218", "Kolar APMC, Karnataka", "563101", "Malur Taluk, Kolar District, Karnataka"),
            ("Bikramjit Singh Rawat", "9876543219", "Harsil Valley, Uttarkashi, Uttarakhand", "249135", "Bhagirathi Valley, Uttarkashi"),
        ]

        farmers = []
        for name, phone, loc, pin, addr in farmers_data:
            f = User(
                name=name,
                role="farmer",
                phone=phone,
                password_hash=generate_password_hash("farmer123"),
                location=loc,
                pincode=pin,
                address=addr,
                avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
            )
            db.session.add(f)
            farmers.append(f)

        # 3. 3 Consumers
        consumers_data = [
            ("Meera Sharma", "9811111111", "South Extension II, New Delhi", "110049", "Flat 402, Narmada Apartments, South Delhi"),
            ("Rohan Kulkarni", "9822222222", "Dadar West, Mumbai", "400028", "201 Shivsagar Society, Shivaji Park, Dadar West"),
            ("Ananya Krishnan", "9833333333", "Indiranagar, Bengaluru", "560038", "12th Main Road, HAL 2nd Stage, Indiranagar"),
        ]
        consumers = []
        for name, phone, loc, pin, addr in consumers_data:
            c = User(
                name=name,
                role="consumer",
                phone=phone,
                password_hash=generate_password_hash("consumer123"),
                location=loc,
                pincode=pin,
                address=addr,
            )
            db.session.add(c)
            consumers.append(c)

        db.session.commit()

        # 4. Products (22 items)
        products_list = [
            Product(
                farmer_id=farmers[4].id,
                crop_name="Desi Organic Tomatoes",
                crop_name_hi="देसी जैविक टमाटर",
                category="vegetable",
                quantity_available=450,
                unit="kg",
                price_per_unit=34,
                mandi_reference_price=52,
                image_url="/images/tomatoes.jpg",
                harvest_date="2026-03-29",
                description="Vine-ripened organic red tomatoes harvested daily in Sonipat green belt.",
            ),
            Product(
                farmer_id=farmers[0].id,
                crop_name="Taraori Basmati Rice (Aged 2 Yr)",
                crop_name_hi="तरावड़ी बासमती चावल (२ वर्ष पुराना)",
                category="grain",
                quantity_available=1200,
                unit="kg",
                price_per_unit=108,
                mandi_reference_price=145,
                image_url="/images/basmati-rice.jpg",
                harvest_date="2025-11-15",
                description="Authentic extra-long grain aromatic Taraori Basmati rice aged naturally for 24 months.",
            ),
            Product(
                farmer_id=farmers[3].id,
                crop_name="Ratnagiri Alphonso Mangoes (Hapus)",
                crop_name_hi="रत्नागिरी हापुस आम (१२ पेटी)",
                category="fruit",
                quantity_available=180,
                unit="dozen",
                price_per_unit=780,
                mandi_reference_price=1200,
                image_url="/images/alphonso-mango.jpg",
                harvest_date="2026-03-28",
                description="GI-tagged Devgad & Ratnagiri Alphonso mangoes ripened naturally on hay.",
            ),
            Product(
                farmer_id=farmers[2].id,
                crop_name="Gir Cow A2 Raw Desi Milk",
                crop_name_hi="गिर गाय A2 शुद्ध कच्चा दूध",
                category="dairy",
                quantity_available=95,
                unit="litre",
                price_per_unit=70,
                mandi_reference_price=95,
                image_url="/images/desi-milk.jpg",
                harvest_date="2026-03-30",
                description="Raw unpasteurized A2 milk from free-grazing purebred Gir cows.",
            ),
            Product(
                farmer_id=farmers[1].id,
                crop_name="Lasalgaon Red Nashik Onions",
                crop_name_hi="लासलगांव लाल नासिक प्याज",
                category="vegetable",
                quantity_available=2500,
                unit="kg",
                price_per_unit=24,
                mandi_reference_price=38,
                image_url="/images/nashik-onions.jpg",
                harvest_date="2026-03-25",
                description="Low-moisture, long shelf-life ruby red onions from Lasalgaon APMC belt.",
            ),
            Product(
                farmer_id=farmers[4].id,
                crop_name="Fresh Organic Palak (Spinach)",
                crop_name_hi="ताजा हरी जैविक पालक",
                category="vegetable",
                quantity_available=160,
                unit="kg",
                price_per_unit=22,
                mandi_reference_price=40,
                image_url="/images/organic-spinach.jpg",
                harvest_date="2026-03-30",
                description="Tender morning-harvested green spinach bunches loaded with iron.",
            ),
            Product(
                farmer_id=farmers[6].id,
                crop_name="Sharbati MP Golden Wheat",
                crop_name_hi="शरबती सीहोर एमपी गेहूँ",
                category="grain",
                quantity_available=40,
                unit="quintal",
                price_per_unit=2790,
                mandi_reference_price=3450,
                image_url="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80",
                harvest_date="2026-03-20",
                description="Golden lustrous Sehore Sharbati wheat grains grown in Malwa black soil.",
            ),
            Product(
                farmer_id=farmers[5].id,
                crop_name="Kinnaur Royal Red Apples",
                crop_name_hi="किन्नौर रॉयल लाल सेब",
                category="fruit",
                quantity_available=650,
                unit="kg",
                price_per_unit=145,
                mandi_reference_price=220,
                image_url="https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop&q=80",
                harvest_date="2026-03-15",
                description="High-altitude crisp juicy Royal Delicious apples from 9,000 ft Kinnaur orchards.",
            ),
            Product(
                farmer_id=farmers[7].id,
                crop_name="Lakadong High-Curcumin Turmeric",
                crop_name_hi="लाकाडोंग उच्च करक्यूमिन हल्दी",
                category="other",
                quantity_available=300,
                unit="kg",
                price_per_unit=235,
                mandi_reference_price=320,
                image_url="https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800&auto=format&fit=crop&q=80",
                harvest_date="2026-03-18",
                description="Single-origin Meghalaya Lakadong turmeric with 9.2% curcumin potency.",
            ),
            Product(
                farmer_id=farmers[2].id,
                crop_name="Artisanal A2 Desi Cow Bilona Ghee",
                crop_name_hi="A2 बिलोना वैदिक देसी घी",
                category="dairy",
                quantity_available=80,
                unit="litre",
                price_per_unit=1650,
                mandi_reference_price=2200,
                image_url="https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=800&auto=format&fit=crop&q=80",
                harvest_date="2026-03-27",
                description="Wooden churned cultured curd Bilona ghee made in small earthen pots.",
            ),
        ]

        for p in products_list:
            db.session.add(p)
        db.session.commit()

        # 5. Orders (12 sample orders)
        o1 = Order(
            product_id=products_list[0].id,
            consumer_id=consumers[0].id,
            farmer_id=products_list[0].farmer_id,
            quantity_ordered=10,
            unit_price=34,
            total_price=340,
            middleman_savings=180,
            delivery_address=consumers[0].address,
            status="completed",
        )
        o2 = Order(
            product_id=products_list[2].id,
            consumer_id=consumers[1].id,
            farmer_id=products_list[2].farmer_id,
            quantity_ordered=3,
            unit_price=780,
            total_price=2340,
            middleman_savings=1260,
            delivery_address=consumers[1].address,
            status="confirmed",
        )
        db.session.add_all([o1, o2])
        db.session.commit()

        # 6. Reviews
        rev1 = Review(
            order_id=o1.id,
            farmer_id=o1.farmer_id,
            consumer_id=o1.consumer_id,
            rating=5,
            comment="The Desi organic tomatoes were sweet and fresh! Saved ₹18/kg compared to Azadpur mandi retail.",
        )
        db.session.add(rev1)
        db.session.commit()

        print("FarmDirect backend seeding complete!")
