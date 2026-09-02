export interface MandiCropReference {
  cropName: string;
  cropNameHi: string;
  category: "vegetable" | "fruit" | "grain" | "dairy" | "other";
  unit: "kg" | "quintal" | "dozen" | "litre";
  mandiAveragePrice: number; // APMC Mandi retail average (₹)
  fairRangeMin: number;
  fairRangeMax: number;
  season: string;
  majorMandis: string[];
}

export const MANDI_REFERENCE_TABLE: Record<string, MandiCropReference> = {
  "Desi Organic Tomatoes": {
    cropName: "Desi Organic Tomatoes",
    cropNameHi: "देसी जैविक टमाटर",
    category: "vegetable",
    unit: "kg",
    mandiAveragePrice: 52,
    fairRangeMin: 28,
    fairRangeMax: 44,
    season: "Rabi & Kharif",
    majorMandis: ["Azadpur (Delhi)", "Kolar (KA)", "Nashik (MH)"],
  },
  "Taraori Basmati Rice (Aged 2 Yr)": {
    cropName: "Taraori Basmati Rice (Aged 2 Yr)",
    cropNameHi: "तरावड़ी बासमती चावल (२ वर्ष पुराना)",
    category: "grain",
    unit: "kg",
    mandiAveragePrice: 145,
    fairRangeMin: 95,
    fairRangeMax: 125,
    season: "Kharif",
    majorMandis: ["Taraori (HR)", "Karnal (HR)", "Amritsar (PB)"],
  },
  "Ratnagiri Alphonso Mangoes (Hapus)": {
    cropName: "Ratnagiri Alphonso Mangoes (Hapus)",
    cropNameHi: "रत्नागिरी हापुस आम (१२ पेटी)",
    category: "fruit",
    unit: "dozen",
    mandiAveragePrice: 1200,
    fairRangeMin: 720,
    fairRangeMax: 950,
    season: "Summer (April-June)",
    majorMandis: ["Vashi APMC (Mumbai)", "Ratnagiri (MH)"],
  },
  "Gir Cow A2 Raw Desi Milk": {
    cropName: "Gir Cow A2 Raw Desi Milk",
    cropNameHi: "गिर गाय A2 शुद्ध कच्चा दूध",
    category: "dairy",
    unit: "litre",
    mandiAveragePrice: 95,
    fairRangeMin: 65,
    fairRangeMax: 82,
    season: "Year Round",
    majorMandis: ["Anand (GJ)", "Rajkot (GJ)"],
  },
  "Lasalgaon Red Nashik Onions": {
    cropName: "Lasalgaon Red Nashik Onions",
    cropNameHi: "लासलगांव लाल नासिक प्याज",
    category: "vegetable",
    unit: "kg",
    mandiAveragePrice: 38,
    fairRangeMin: 22,
    fairRangeMax: 30,
    season: "Rabi",
    majorMandis: ["Lasalgaon (MH)", "Pimpalgaon (MH)"],
  },
  "Fresh Organic Palak (Spinach)": {
    cropName: "Fresh Organic Palak (Spinach)",
    cropNameHi: "ताजा हरी जैविक पालक",
    category: "vegetable",
    unit: "kg",
    mandiAveragePrice: 40,
    fairRangeMin: 20,
    fairRangeMax: 32,
    season: "Winter",
    majorMandis: ["Ghazipur (Delhi)", "Sonepat (HR)"],
  },
  "Sharbati MP Golden Wheat": {
    cropName: "Sharbati MP Golden Wheat",
    cropNameHi: "शरबती सीहोर एमपी गेहूँ",
    category: "grain",
    unit: "quintal",
    mandiAveragePrice: 3450,
    fairRangeMin: 2650,
    fairRangeMax: 3050,
    season: "Rabi",
    majorMandis: ["Sehore (MP)", "Vidisha (MP)"],
  },
  "Kinnaur Royal Red Apples": {
    cropName: "Kinnaur Royal Red Apples",
    cropNameHi: "किन्नौर रॉयल लाल सेब",
    category: "fruit",
    unit: "kg",
    mandiAveragePrice: 220,
    fairRangeMin: 135,
    fairRangeMax: 175,
    season: "Autumn",
    majorMandis: ["Shimla (HP)", "Azadpur (Delhi)"],
  },
  "Lakadong High-Curcumin Turmeric": {
    cropName: "Lakadong High-Curcumin Turmeric",
    cropNameHi: "लाकाडोंग उच्च करक्यूमिन हल्दी",
    category: "other",
    unit: "kg",
    mandiAveragePrice: 320,
    fairRangeMin: 210,
    fairRangeMax: 265,
    season: "Winter Harvest",
    majorMandis: ["Nizamabad (TS)", "Erode (TN)"],
  },
  "Pahari Pahadi Rajma (Red Kidney Beans)": {
    cropName: "Pahari Pahadi Rajma (Red Kidney Beans)",
    cropNameHi: "हर्षिल पहाड़ी राजमा",
    category: "grain",
    unit: "kg",
    mandiAveragePrice: 195,
    fairRangeMin: 125,
    fairRangeMax: 155,
    season: "Kharif",
    majorMandis: ["Harsil (UK)", "Dehradun (UK)"],
  },
};

/**
 * Computes Fair-Price Badge status for any listing.
 * Returns whether price is "FAIR_PRICE", "BARGAIN", or "HIGH_ABOVE_MANDI"
 * plus savings percentage vs APMC Mandi retail.
 */
export function getFairPriceAnalysis(
  pricePerUnit: number,
  mandiReferencePrice: number
): {
  badgeType: "FAIR_PRICE" | "BEST_VALUE" | "ABOVE_MANDI";
  badgeLabelEn: string;
  badgeLabelHi: string;
  savingsPercentage: number;
  savingsRupees: number;
} {
  const diff = mandiReferencePrice - pricePerUnit;
  const savingsPct =
    mandiReferencePrice > 0
      ? Math.round(((mandiReferencePrice - pricePerUnit) / mandiReferencePrice) * 100)
      : 0;

  if (pricePerUnit <= mandiReferencePrice * 0.85) {
    return {
      badgeType: "BEST_VALUE",
      badgeLabelEn: `Direct Deal • Save ${savingsPct}% vs Mandi`,
      badgeLabelHi: `सीधा किसान • मंडी से ${savingsPct}% बचत`,
      savingsPercentage: Math.max(0, savingsPct),
      savingsRupees: Math.max(0, Math.round(diff * 10) / 10),
    };
  } else if (pricePerUnit <= mandiReferencePrice * 1.02) {
    return {
      badgeType: "FAIR_PRICE",
      badgeLabelEn: `Govt Fair Range • Save ${Math.max(5, savingsPct)}%`,
      badgeLabelHi: `सरकारी उचित दर • ${Math.max(5, savingsPct)}% बचत`,
      savingsPercentage: Math.max(0, savingsPct),
      savingsRupees: Math.max(0, Math.round(diff * 10) / 10),
    };
  } else {
    return {
      badgeType: "ABOVE_MANDI",
      badgeLabelEn: `Premium Organic Grade`,
      badgeLabelHi: `प्रीमियम जैविक ग्रेड`,
      savingsPercentage: 0,
      savingsRupees: 0,
    };
  }
}
