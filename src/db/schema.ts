import {
  pgTable,
  serial,
  varchar,
  text,
  real,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("consumer"), // 'farmer' | 'consumer' | 'admin'
  phone: varchar("phone", { length: 50 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }), // e.g. "Karnal, Haryana", "Nashik, Maharashtra"
  pincode: varchar("pincode", { length: 20 }),
  address: text("address"),
  avatarUrl: varchar("avatar_url", { length: 512 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  farmerId: integer("farmer_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  cropName: varchar("crop_name", { length: 255 }).notNull(),
  cropNameHi: varchar("crop_name_hi", { length: 255 }),
  category: varchar("category", { length: 64 }).notNull(), // 'vegetable' | 'fruit' | 'grain' | 'dairy' | 'other'
  quantityAvailable: real("quantity_available").notNull(),
  unit: varchar("unit", { length: 50 }).notNull().default("kg"), // 'kg' | 'quintal' | 'dozen' | 'litre'
  pricePerUnit: real("price_per_unit").notNull(),
  mandiReferencePrice: real("mandi_reference_price").notNull(), // APMC / Mandi market average price
  imageUrl: varchar("image_url", { length: 512 }),
  harvestDate: varchar("harvest_date", { length: 64 }),
  description: text("description"),
  descriptionHi: text("description_hi"),
  status: varchar("status", { length: 50 }).notNull().default("active"), // 'active' | 'sold_out' | 'removed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .references(() => products.id, { onDelete: "set null" }),
  consumerId: integer("consumer_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  farmerId: integer("farmer_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  quantityOrdered: real("quantity_ordered").notNull(),
  unitPrice: real("unit_price").notNull(),
  totalPrice: real("total_price").notNull(),
  middlemanSavings: real("middleman_savings").notNull().default(0),
  deliveryAddress: text("delivery_address"),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .references(() => orders.id, { onDelete: "cascade" }),
  farmerId: integer("farmer_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  consumerId: integer("consumer_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  rating: integer("rating").notNull(), // 1 to 5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mandiPriceHistory = pgTable("mandi_price_history", {
  id: serial("id").primaryKey(),
  cropName: varchar("crop_name", { length: 255 }).notNull(),
  dayLabel: varchar("day_label", { length: 64 }).notNull(),
  mandiPrice: real("mandi_price").notNull(),
  farmDirectPrice: real("farmdirect_price").notNull(),
});

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
export type ProductRow = typeof products.$inferSelect;
export type NewProductRow = typeof products.$inferInsert;
export type OrderRow = typeof orders.$inferSelect;
export type NewOrderRow = typeof orders.$inferInsert;
export type ReviewRow = typeof reviews.$inferSelect;
export type NewReviewRow = typeof reviews.$inferInsert;
