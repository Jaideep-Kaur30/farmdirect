import { db } from "@/db";
import {
  users,
  products,
  orders,
  reviews,
  mandiPriceHistory,
} from "@/db/schema";
import { hashPassword } from "./auth";
import { count } from "drizzle-orm";

export async function ensureSeeded() {
  try {
    const [{ value: userCount }] = await db.select({ value: count() }).from(users);
    if (userCount && Number(userCount) >= 12) {
      return { seeded: false, message: "Database already populated with demo seed data." };
    }

    // Clean existing rows before re-seeding cleanly
    await db.delete(reviews);
    await db.delete(orders);
    await db.delete(products);
    await db.delete(mandiPriceHistory);
    await db.delete(users);

    const adminPassword = await hashPassword("admin123");
    const farmerPassword = await hashPassword("farmer123");
    const consumerPassword = await hashPassword("consumer123");

    // 1. Admin
    const [adminUser] = await db
      .insert(users)
      .values({
        name: "Dr. Arvind Swaminathan (MoCA Mandi Director)",
        role: "admin",
        phone: "9999999999",
        passwordHash: adminPassword,
        location: "Krishi Bhawan, New Delhi",
        pincode: "110001",
        address: "Ministry of Consumer Affairs, Krishi Bhawan, Rajpath Area, New Delhi",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      })
      .returning();

    // 2. 10 Sample Indian Farmers
    const farmersData = [
      {
        name: "Sardar Harbhajan Singh",
        phone: "9876543210",
        location: "Karnal Mandi, Haryana",
        pincode: "132001",
        address: "Village Taraori, District Karnal, Haryana (Organic Basmati & Wheat)",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      },
      {
        name: "Balasaheb Tukaram Deshmukh",
        phone: "9876543211",
        location: "Lasalgaon APMC, Nashik, Maharashtra",
        pincode: "422306",
        address: "Niphad Taluka, Nashik District, Maharashtra (Red Onions & Grapes)",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
      },
      {
        name: "Savita Ben Patel",
        phone: "9876543212",
        location: "Anand Dairy Cooperative, Gujarat",
        pincode: "388001",
        address: "Borsad Village, Anand District, Gujarat (Gir Cow A2 Desi Dairy)",
        avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
      },
      {
        name: "Prakash Sawant",
        phone: "9876543213",
        location: "Devgad & Ratnagiri Coast, Maharashtra",
        pincode: "415612",
        address: "Pawaskadi Orchard, Ratnagiri, Konkan Belt (GI Tagged Alphonso Mangoes)",
        avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80",
      },
      {
        name: "Ramkhelawan Yadav",
        phone: "9876543214",
        location: "Sonipat Organic Belt, Haryana",
        pincode: "131001",
        address: "Murthal Village, Sonipat, NCR Green Belt (Desi Tomatoes & Leafy Greens)",
        avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80",
      },
      {
        name: "Thakur Thakurdas Negi",
        phone: "9876543215",
        location: "Kalpa Orchard, Kinnaur, Himachal Pradesh",
        pincode: "172107",
        address: "Sangla Valley High Altitude Orchard, Kinnaur (Royal Red Crisp Apples)",
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
      },
      {
        name: "Kailash Chand Patidar",
        phone: "9876543216",
        location: "Sehore Mandi, Madhya Pradesh",
        pincode: "466001",
        address: "Ashta Tehsil, Sehore District, MP (Rainfed Sharbati Golden Wheat)",
        avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
      },
      {
        name: "Riluk Nongbri",
        phone: "9876543217",
        location: "Jaintia Hills, Meghalaya",
        pincode: "793150",
        address: "Lakadong Village, West Jaintia Hills, Meghalaya (9.2% High Curcumin Turmeric)",
        avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
      },
      {
        name: "Chandrappa Gowda",
        phone: "9876543218",
        location: "Kolar APMC, Karnataka",
        pincode: "563101",
        address: "Malur Taluk, Kolar District, Karnataka (Pomegranates & Green Chillies)",
        avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
      },
      {
        name: "Bikramjit Singh Rawat",
        phone: "9876543219",
        location: "Harsil Valley, Uttarkashi, Uttarakhand",
        pincode: "249135",
        address: "Bhagirathi Valley, Uttarkashi (Pahari Rajma & Wild Forest Honey)",
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
      },
    ];

    const insertedFarmers = await db
      .insert(users)
      .values(
        farmersData.map((f) => ({
          name: f.name,
          role: "farmer",
          phone: f.phone,
          passwordHash: farmerPassword,
          location: f.location,
          pincode: f.pincode,
          address: f.address,
          avatarUrl: f.avatarUrl,
        }))
      )
      .returning();

    // 3. Sample Consumers
    const consumersData = [
      {
        name: "Meera Sharma",
        phone: "9811111111",
        location: "South Extension II, New Delhi",
        pincode: "110049",
        address: "Flat 402, Narmada Apartments, Ring Road, South Delhi",
      },
      {
        name: "Rohan Kulkarni",
        phone: "9822222222",
        location: "Dadar West, Mumbai",
        pincode: "400028",
        address: "201 Shivsagar Society, Shivaji Park, Dadar West, Mumbai",
      },
      {
        name: "Ananya Krishnan",
        phone: "9833333333",
        location: "Indiranagar, Bengaluru",
        pincode: "560038",
        address: "12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru",
      },
    ];

    const insertedConsumers = await db
      .insert(users)
      .values(
        consumersData.map((c) => ({
          name: c.name,
          role: "consumer",
          phone: c.phone,
          passwordHash: consumerPassword,
          location: c.location,
          pincode: c.pincode,
          address: c.address,
        }))
      )
      .returning();

    // 4. Sample Products (22 items across all 4 categories)
    const productRows = [
      {
        farmerId: insertedFarmers[4].id, // Ramkhelawan Yadav (Sonipat)
        cropName: "Desi Organic Tomatoes",
        cropNameHi: "देसी जैविक टमाटर",
        category: "vegetable",
        quantityAvailable: 450,
        unit: "kg",
        pricePerUnit: 34,
        mandiReferencePrice: 52, // 35% cheaper than mandi/middlemen
        imageUrl: "/images/tomatoes.jpg",
        harvestDate: "2026-03-29",
        description:
          "Handpicked vine-ripened Desi organic red tomatoes grown without synthetic pesticides in Sonipat green belt. Zero cold-storage delay.",
        descriptionHi:
          "सोनीपत के खेतों से बिना रासायनिक कीटनाशक के उगाए गए ताजे लाल देसी टमाटर। सीधे खेत से रसोई तक।",
        status: "active",
      },
      {
        farmerId: insertedFarmers[0].id, // Harbhajan Singh (Karnal)
        cropName: "Taraori Basmati Rice (Aged 2 Yr)",
        cropNameHi: "तरावड़ी बासमती चावल (२ वर्ष पुराना)",
        category: "grain",
        quantityAvailable: 1200,
        unit: "kg",
        pricePerUnit: 108,
        mandiReferencePrice: 145,
        imageUrl: "/images/basmati-rice.jpg",
        harvestDate: "2025-11-15",
        description:
          "Authentic extra-long grain aromatic Taraori Basmati rice aged naturally for 24 months in traditional Haryana gunny bags.",
        descriptionHi:
          "तरावड़ी करनाल का असली लंबा सुगंधित बासमती चावल, २ साल तक प्राकृतिक रूप से पकाया गया।",
        status: "active",
      },
      {
        farmerId: insertedFarmers[3].id, // Prakash Sawant (Ratnagiri)
        cropName: "Ratnagiri Alphonso Mangoes (Hapus)",
        cropNameHi: "रत्नागिरी हापुस आम (१२ पेटी)",
        category: "fruit",
        quantityAvailable: 180,
        unit: "dozen",
        pricePerUnit: 780,
        mandiReferencePrice: 1200, // Direct saves ₹420/dozen
        imageUrl: "/images/alphonso-mango.jpg",
        harvestDate: "2026-03-28",
        description:
          "GI-tagged Devgad & Ratnagiri Alphonso mangoes ripened naturally on hay without carbide chemicals. Sweet golden pulp guaranteed.",
        descriptionHi:
          "जीआई टैग प्रमाणित रत्नागिरी हापुस आम, बिना कार्बाइड के घास पर प्राकृतिक रूप से पकाए गए।",
        status: "active",
      },
      {
        farmerId: insertedFarmers[2].id, // Savita Ben Patel (Anand)
        cropName: "Gir Cow A2 Raw Desi Milk",
        cropNameHi: "गिर गाय A2 शुद्ध कच्चा दूध",
        category: "dairy",
        quantityAvailable: 95,
        unit: "litre",
        pricePerUnit: 70,
        mandiReferencePrice: 95,
        imageUrl: "/images/desi-milk.jpg",
        harvestDate: "2026-03-30",
        description:
          "Farm-chilled raw unpasteurized A2 milk from free-grazing purebred Gir cows fed organic Lucerne grass.",
        descriptionHi:
          "खुले चरागाह की शुद्ध गिर गायों का ताजा A2 कच्चा दूध। बिना मिलावट सीधा डेयरी से।",
        status: "active",
      },
      {
        farmerId: insertedFarmers[1].id, // Balasaheb Deshmukh (Nashik)
        cropName: "Lasalgaon Red Nashik Onions",
        cropNameHi: "लासलगांव लाल नासिक प्याज",
        category: "vegetable",
        quantityAvailable: 2500,
        unit: "kg",
        pricePerUnit: 24,
        mandiReferencePrice: 38,
        imageUrl: "/images/nashik-onions.jpg",
        harvestDate: "2026-03-25",
        description:
          "Low-moisture, long shelf-life ruby red onions from Lasalgaon APMC belt. Direct from farmer storage chawl.",
        descriptionHi:
          "लासलगांव नासिक का लाल कुरकुरा प्याज। लंबे समय तक टिकने वाली उत्तम रबी फसल।",
        status: "active",
      },
      {
        farmerId: insertedFarmers[4].id, // Ramkhelawan Yadav
        cropName: "Fresh Organic Palak (Spinach)",
        cropNameHi: "ताजा हरी जैविक पालक",
        category: "vegetable",
        quantityAvailable: 160,
        unit: "kg",
        pricePerUnit: 22,
        mandiReferencePrice: 40,
        imageUrl: "/images/organic-spinach.jpg",
        harvestDate: "2026-03-30",
        description:
          "Tender morning-harvested green spinach bunches loaded with iron and folate. Harvested at 5:00 AM.",
        descriptionHi:
          "सुबह ५ बजे कटी हुई ताजी हरी पालक। बिना रासायनिक खाद की भरपूर आयरन वाली पत्तियां।",
        status: "active",
      },
      {
        farmerId: insertedFarmers[6].id, // Kailash Chand Patidar (Sehore MP)
        cropName: "Sharbati MP Golden Wheat",
        cropNameHi: "शरबती सीहोर एमपी गेहूँ",
        category: "grain",
        quantityAvailable: 40,
        unit: "quintal",
        pricePerUnit: 2790,
        mandiReferencePrice: 3450,
        imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80",
        harvestDate: "2026-03-20",
        description:
          "Golden lustrous Sehore Sharbati wheat grains grown with Malwa plateau black soil and natural dew irrigation. Softest rotis.",
        descriptionHi:
          "सीहोर मालवा का प्रसिद्ध शरबती सुनहरा गेहूं। रोटियां २४ घंटे तक नर्म रहती हैं।",
        status: "active",
      },
      {
        farmerId: insertedFarmers[5].id, // Thakurdas Negi (Kinnaur HP)
        cropName: "Kinnaur Royal Red Apples",
        cropNameHi: "किन्नौर रॉयल लाल सेब",
        category: "fruit",
        quantityAvailable: 650,
        unit: "kg",
        pricePerUnit: 145,
        mandiReferencePrice: 220,
        imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop&q=80",
        harvestDate: "2026-03-15",
        description:
          "High-altitude crisp juicy Royal Delicious apples from 9,000 ft Kinnaur orchards with zero wax coating.",
        descriptionHi:
          "९००० फीट ऊंचाई के किन्नौर बागानों से बिना वैक्स कोटिंग वाले मीठे कुरकुरे लाल सेब।",
        status: "active",
      },
      {
        farmerId: insertedFarmers[7].id, // Riluk Nongbri (Meghalaya)
        cropName: "Lakadong High-Curcumin Turmeric",
        cropNameHi: "लाकाडोंग उच्च करक्यूमिन हल्दी",
        category: "other",
        quantityAvailable: 300,
        unit: "kg",
        pricePerUnit: 235,
        mandiReferencePrice: 320,
        imageUrl: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800&auto=format&fit=crop&q=80",
        harvestDate: "2026-03-18",
        description:
          "Single-origin Meghalaya Lakadong turmeric powder with verified 9.2% curcumin potency. Shade dried and stone ground.",
        descriptionHi:
          "मेघालय के लाकाडोंग गांव की ९.२% करक्यूमिन वाली पत्थर पर पिसी शुद्ध हल्दी।",
        status: "active",
      },
      {
        farmerId: insertedFarmers[9].id, // Bikramjit Singh Rawat (Uttarakhand)
        cropName: "Pahari Pahadi Rajma (Red Kidney Beans)",
        cropNameHi: "हर्षिल पहाड़ी राजमा",
        category: "grain",
        quantityAvailable: 500,
        unit: "kg",
        pricePerUnit: 135,
        mandiReferencePrice: 195,
        imageUrl: "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=800&auto=format&fit=crop&q=80",
        harvestDate: "2026-02-28",
        description:
          "Glacier-water nourished Harsil valley Pahari red rajma that cooks buttery soft without soaking chemicals.",
        descriptionHi:
          "भागीरथी घाटी हर्षिल का स्वादिष्ट पहाड़ी राजमा जो जल्दी और मक्खन जैसा मुलायम गलता है।",
        status: "active",
      },
      {
        farmerId: insertedFarmers[2].id, // Savita Ben Patel
        cropName: "Artisanal A2 Desi Cow Bilona Ghee",
        cropNameHi: "A2 बिलोना वैदिक देसी घी",
        category: "dairy",
        quantityAvailable: 80,
        unit: "litre",
        pricePerUnit: 1650,
        mandiReferencePrice: 2200,
        imageUrl: "https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=800&auto=format&fit=crop&q=80",
        harvestDate: "2026-03-27",
        description:
          "Traditional wooden churned (Bilona method) golden cultured curd ghee made in small earthen pots.",
        descriptionHi:
          "मिट्टी की मटकी और लकड़ी की मथनी से बिलोना विधि द्वारा बना शुद्ध वैदिक A2 घी।",
        status: "active",
      },
      {
        farmerId: insertedFarmers[8].id, // Chandrappa Gowda (Kolar)
        cropName: "Bhagwa Ruby Red Pomegranates",
        cropNameHi: "भगवा लाल अनार",
        category: "fruit",
        quantityAvailable: 340,
        unit: "kg",
        pricePerUnit: 110,
        mandiReferencePrice: 165,
        imageUrl: "https://images.unsplash.com/photo-1541344999736-83eca272f6fc?w=800&auto=format&fit=crop&q=80",
        harvestDate: "2026-03-27",
        description:
          "Soft-seeded sweet Bhagwa pomegranates from Kolar orchards packed with natural ruby arils.",
        descriptionHi:
          "नरम बीज वाले मीठे भगवा अनार, कोलार कर्नाटक के किसानों से सीधे।",
        status: "active",
      },
      {
        farmerId: insertedFarmers[1].id, // Balasaheb Deshmukh
        cropName: "Thompson Seedless Green Grapes",
        cropNameHi: "नाशिक हरी अंगूर (बीजरहित)",
        category: "fruit",
        quantityAvailable: 420,
        unit: "kg",
        pricePerUnit: 68,
        mandiReferencePrice: 110,
        imageUrl: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=800&auto=format&fit=crop&q=80",
        harvestDate: "2026-03-29",
        description:
          "Export-grade crisp green seedless table grapes from Niphad vineyards with 20+ Brix natural sweetness.",
        descriptionHi:
          "निफाड नाशिक के मीठे कुरकुरे बीजरहित हरे अंगूर। निर्यात गुणवत्ता।",
        status: "active",
      },
      {
        farmerId: insertedFarmers[4].id,
        cropName: "Fresh Pahadi Cauliflower (Gobhi)",
        cropNameHi: "ताजा सफेद फूलगोभी",
        category: "vegetable",
        quantityAvailable: 280,
        unit: "kg",
        pricePerUnit: 26,
        mandiReferencePrice: 42,
        imageUrl: "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=800&auto=format&fit=crop&q=80",
        harvestDate: "2026-03-30",
        description:
          "Compact snow-white organic cauliflower heads with protective wrapper leaves.",
        descriptionHi:
          "ताजी कसी हुई सफेद फूलगोभी, बिना कीड़ों के साफ सुथरी।",
        status: "active",
      },
      {
        farmerId: insertedFarmers[8].id,
        cropName: "Spicy Guntur Green Chillies",
        cropNameHi: "गुंटूर तीखी हरी मिर्च",
        category: "vegetable",
        quantityAvailable: 190,
        unit: "kg",
        pricePerUnit: 48,
        mandiReferencePrice: 75,
        imageUrl: "https://images.unsplash.com/photo-1583119912267-cc97c911e416?w=800&auto=format&fit=crop&q=80",
        harvestDate: "2026-03-29",
        description:
          "Crisp aromatic green chillies with rich capsaicin heat, handpicked daily.",
        descriptionHi:
          "तीखी स्वादिष्ट हरी मिर्च, चटनी और तड़के के लिए आदर्श।",
        status: "active",
      },
      {
        farmerId: insertedFarmers[9].id,
        cropName: "Raw High-Altitude Forest Multiflora Honey",
        cropNameHi: "उत्तराखंड जंगली कच्चा शहद",
        category: "other",
        quantityAvailable: 110,
        unit: "kg",
        pricePerUnit: 480,
        mandiReferencePrice: 720,
        imageUrl: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&auto=format&fit=crop&q=80",
        harvestDate: "2026-03-10",
        description:
          "Unheated, unpasteurized raw forest honey collected from Himalayan rhododendron and wildflower flora.",
        descriptionHi:
          "हिमालय के बुरांश और जंगली फूलों का कच्चा बिना गर्म किया गया शुद्ध शहद।",
        status: "active",
      },
      {
        farmerId: insertedFarmers[0].id,
        cropName: "Organic Yellow Moong Dal (Split)",
        cropNameHi: "जैविक पीली मूंग दाल",
        category: "grain",
        quantityAvailable: 850,
        unit: "kg",
        pricePerUnit: 112,
        mandiReferencePrice: 155,
        imageUrl: "https://images.unsplash.com/photo-1585996746475-4bb8cf14e7a8?w=800&auto=format&fit=crop&q=80",
        harvestDate: "2026-02-15",
        description:
          "Unpolished organic yellow moong dal retaining natural dietary fiber and aroma.",
        descriptionHi:
          "बिना पॉलिश की शुद्ध पीली मूंग दाल, सुपाच्य और पौष्टिक।",
        status: "active",
      },
      {
        farmerId: insertedFarmers[2].id,
        cropName: "Fresh Farm Malai Paneer",
        cropNameHi: "ताजा मलाई पनीर",
        category: "dairy",
        quantityAvailable: 60,
        unit: "kg",
        pricePerUnit: 310,
        mandiReferencePrice: 420,
        imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80",
        harvestDate: "2026-03-30",
        description:
          "Soft melt-in-mouth cottage cheese curdled daily using fresh lemon juice from pure cow milk.",
        descriptionHi:
          "ताजे दूध और नींबू से रोज तैयार नर्म मलाईदार पनीर।",
        status: "active",
      },
      {
        farmerId: insertedFarmers[3].id,
        cropName: "Organic Konkan Cashew Nuts (W320 Grade)",
        cropNameHi: "कोंकण काजू (W320 प्रीमियम)",
        category: "other",
        quantityAvailable: 210,
        unit: "kg",
        pricePerUnit: 790,
        mandiReferencePrice: 1150,
        imageUrl: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=800&auto=format&fit=crop&q=80",
        harvestDate: "2026-03-22",
        description:
          "Crisp whole jumbo W320 grade cashews roasted over traditional cashew shell fire.",
        descriptionHi:
          "रत्नागिरी कोंकण के बड़े कुरकुरे साबुत W320 काजू।",
        status: "active",
      },
      {
        farmerId: insertedFarmers[4].id,
        cropName: "Agra Chandramukhi Potatoes",
        cropNameHi: "आगरा चंद्रमुखी आलू",
        category: "vegetable",
        quantityAvailable: 3200,
        unit: "kg",
        pricePerUnit: 18,
        mandiReferencePrice: 28,
        imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80",
        harvestDate: "2026-03-26",
        description:
          "Freshly dug Chandramukhi table potatoes ideal for aloo paratha, dum aloo, and crispy chips.",
        descriptionHi:
          "ताजा खुदा हुआ सफेद चंद्रमुखी आलू, पराठों और सब्जी के लिए उत्तम।",
        status: "active",
      },
    ];

    const insertedProducts = await db
      .insert(products)
      .values(productRows)
      .returning();

    // 5. Sample Orders (12 orders covering all statuses)
    const sampleOrders = [
      {
        productId: insertedProducts[0].id, // Tomatoes
        consumerId: insertedConsumers[0].id, // Meera Sharma
        farmerId: insertedProducts[0].farmerId,
        quantityOrdered: 10,
        unitPrice: 34,
        totalPrice: 340,
        middlemanSavings: (52 - 34) * 10, // ₹180 saved!
        deliveryAddress: "Flat 402, Narmada Apartments, Ring Road, South Delhi",
        status: "pending",
      },
      {
        productId: insertedProducts[2].id, // Alphonso Mangoes
        consumerId: insertedConsumers[1].id, // Rohan Kulkarni
        farmerId: insertedProducts[2].farmerId,
        quantityOrdered: 3,
        unitPrice: 780,
        totalPrice: 2340,
        middlemanSavings: (1200 - 780) * 3, // ₹1,260 saved!
        deliveryAddress: "201 Shivsagar Society, Shivaji Park, Dadar West, Mumbai",
        status: "confirmed",
      },
      {
        productId: insertedProducts[1].id, // Taraori Basmati Rice
        consumerId: insertedConsumers[0].id,
        farmerId: insertedProducts[1].farmerId,
        quantityOrdered: 25,
        unitPrice: 108,
        totalPrice: 2700,
        middlemanSavings: (145 - 108) * 25, // ₹925 saved!
        deliveryAddress: "Flat 402, Narmada Apartments, Ring Road, South Delhi",
        status: "ready",
      },
      {
        productId: insertedProducts[3].id, // Gir Cow A2 Milk
        consumerId: insertedConsumers[2].id, // Ananya Krishnan
        farmerId: insertedProducts[3].farmerId,
        quantityOrdered: 15,
        unitPrice: 70,
        totalPrice: 1050,
        middlemanSavings: (95 - 70) * 15, // ₹375 saved!
        deliveryAddress: "12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru",
        status: "completed",
      },
      {
        productId: insertedProducts[4].id, // Nashik Onions
        consumerId: insertedConsumers[1].id,
        farmerId: insertedProducts[4].farmerId,
        quantityOrdered: 20,
        unitPrice: 24,
        totalPrice: 480,
        middlemanSavings: (38 - 24) * 20, // ₹280 saved!
        deliveryAddress: "201 Shivsagar Society, Shivaji Park, Dadar West, Mumbai",
        status: "completed",
      },
      {
        productId: insertedProducts[5].id, // Fresh Palak
        consumerId: insertedConsumers[0].id,
        farmerId: insertedProducts[5].farmerId,
        quantityOrdered: 5,
        unitPrice: 22,
        totalPrice: 110,
        middlemanSavings: (40 - 22) * 5, // ₹90 saved!
        deliveryAddress: "Flat 402, Narmada Apartments, Ring Road, South Delhi",
        status: "completed",
      },
      {
        productId: insertedProducts[7].id, // Kinnaur Apples
        consumerId: insertedConsumers[2].id,
        farmerId: insertedProducts[7].farmerId,
        quantityOrdered: 10,
        unitPrice: 145,
        totalPrice: 1450,
        middlemanSavings: (220 - 145) * 10, // ₹750 saved!
        deliveryAddress: "12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru",
        status: "completed",
      },
      {
        productId: insertedProducts[8].id, // Lakadong Turmeric
        consumerId: insertedConsumers[0].id,
        farmerId: insertedProducts[8].farmerId,
        quantityOrdered: 2,
        unitPrice: 235,
        totalPrice: 470,
        middlemanSavings: (320 - 235) * 2, // ₹170 saved!
        deliveryAddress: "Flat 402, Narmada Apartments, Ring Road, South Delhi",
        status: "completed",
      },
      {
        productId: insertedProducts[10].id, // A2 Bilona Ghee
        consumerId: insertedConsumers[1].id,
        farmerId: insertedProducts[10].farmerId,
        quantityOrdered: 2,
        unitPrice: 1650,
        totalPrice: 3300,
        middlemanSavings: (2200 - 1650) * 2, // ₹1,100 saved!
        deliveryAddress: "201 Shivsagar Society, Shivaji Park, Dadar West, Mumbai",
        status: "completed",
      },
      {
        productId: insertedProducts[15].id, // Himalayan Raw Honey
        consumerId: insertedConsumers[2].id,
        farmerId: insertedProducts[15].farmerId,
        quantityOrdered: 3,
        unitPrice: 480,
        totalPrice: 1440,
        middlemanSavings: (720 - 480) * 3, // ₹720 saved!
        deliveryAddress: "12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru",
        status: "pending",
      },
      {
        productId: insertedProducts[6].id, // Sharbati Wheat
        consumerId: insertedConsumers[0].id,
        farmerId: insertedProducts[6].farmerId,
        quantityOrdered: 1, // 1 quintal
        unitPrice: 2790,
        totalPrice: 2790,
        middlemanSavings: 3450 - 2790, // ₹660 saved!
        deliveryAddress: "Flat 402, Narmada Apartments, Ring Road, South Delhi",
        status: "confirmed",
      },
      {
        productId: insertedProducts[19].id, // Agra Potatoes
        consumerId: insertedConsumers[1].id,
        farmerId: insertedProducts[19].farmerId,
        quantityOrdered: 15,
        unitPrice: 18,
        totalPrice: 270,
        middlemanSavings: (28 - 18) * 15, // ₹150 saved!
        deliveryAddress: "201 Shivsagar Society, Shivaji Park, Dadar West, Mumbai",
        status: "completed",
      },
    ];

    const insertedOrders = await db
      .insert(orders)
      .values(sampleOrders)
      .returning();

    // 6. Sample Reviews (verified star ratings after completion)
    const reviewRows = [
      {
        orderId: insertedOrders[3].id,
        farmerId: insertedOrders[3].farmerId,
        consumerId: insertedOrders[3].consumerId,
        rating: 5,
        comment:
          "The A2 Gir Cow raw milk has thick natural malai and pure sweet aroma. Zero comparison with packet milk!",
      },
      {
        orderId: insertedOrders[4].id,
        farmerId: insertedOrders[4].farmerId,
        consumerId: insertedOrders[4].consumerId,
        rating: 5,
        comment:
          "Saved ₹280 buying Lasalgaon red onions directly from Balasaheb ji. Super dry and zero rotting bulbs.",
      },
      {
        orderId: insertedOrders[5].id,
        farmerId: insertedOrders[5].farmerId,
        consumerId: insertedOrders[5].consumerId,
        rating: 5,
        comment:
          "Palak leaves were crisp and arrived within 6 hours of morning harvest in Sonipat. Truly direct farm quality.",
      },
      {
        orderId: insertedOrders[6].id,
        farmerId: insertedOrders[6].farmerId,
        consumerId: insertedOrders[6].consumerId,
        rating: 5,
        comment:
          "Kinnaur apples are crunchy and juicy with no chemical wax coating. My whole family loved them.",
      },
      {
        orderId: insertedOrders[7].id,
        farmerId: insertedOrders[7].farmerId,
        consumerId: insertedOrders[7].consumerId,
        rating: 5,
        comment:
          "Lakadong turmeric from Meghalaya has deep saffron-gold color. Half a teaspoon colors a whole pot of dal.",
      },
      {
        orderId: insertedOrders[8].id,
        farmerId: insertedOrders[8].farmerId,
        consumerId: insertedOrders[8].consumerId,
        rating: 5,
        comment:
          "Authentic Bilona wooden churned A2 Ghee. Reminded my grandmother of village ghee in Gujarat.",
      },
      {
        orderId: insertedOrders[11].id,
        farmerId: insertedOrders[11].farmerId,
        consumerId: insertedOrders[11].consumerId,
        rating: 4,
        comment:
          "Chandramukhi potatoes cooked fast and made wonderful crispy aloo tikkis.",
      },
    ];

    await db.insert(reviews).values(reviewRows);

    // 7. 30-Day Agmarknet APMC Mandi vs FarmDirect Direct Price Trend Data
    const trendCrops = [
      {
        cropName: "Desi Organic Tomatoes",
        baseMandi: 52,
        baseFarm: 34,
      },
      {
        cropName: "Taraori Basmati Rice (Aged 2 Yr)",
        baseMandi: 145,
        baseFarm: 108,
      },
      {
        cropName: "Ratnagiri Alphonso Mangoes (Hapus)",
        baseMandi: 1200,
        baseFarm: 780,
      },
      {
        cropName: "Gir Cow A2 Raw Desi Milk",
        baseMandi: 95,
        baseFarm: 70,
      },
      {
        cropName: "Lasalgaon Red Nashik Onions",
        baseMandi: 38,
        baseFarm: 24,
      },
    ];

    const pricePoints: Array<{
      cropName: string;
      dayLabel: string;
      mandiPrice: number;
      farmDirectPrice: number;
    }> = [];

    const days = ["Day -25", "Day -20", "Day -15", "Day -10", "Day -5", "Today"];
    trendCrops.forEach((c) => {
      days.forEach((day, idx) => {
        const jitterMandi = Math.round((Math.sin(idx + 1) * 3 + idx * 0.5) * 10) / 10;
        const jitterFarm = Math.round((Math.cos(idx + 1) * 1.5) * 10) / 10;
        pricePoints.push({
          cropName: c.cropName,
          dayLabel: day,
          mandiPrice: Math.max(10, c.baseMandi + jitterMandi),
          farmDirectPrice: Math.max(10, c.baseFarm + jitterFarm),
        });
      });
    });

    await db.insert(mandiPriceHistory).values(pricePoints);

    return {
      seeded: true,
      message: `Populated FarmDirect DB with ${insertedFarmers.length} Farmers, ${insertedConsumers.length} Consumers, ${insertedProducts.length} Products, ${insertedOrders.length} Orders, ${reviewRows.length} Reviews, and APMC Mandi trends.`,
    };
  } catch (err) {
    console.error("Seeding error:", err);
    throw err;
  }
}
