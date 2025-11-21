/**
 * Database schema for deals table
 * 
 * Stores shopping deals fetched from external APIs (like SerpAPI).
 * Column names use snake_case to follow PostgreSQL conventions.
 * 
 * Note: Drizzle ORM with camelCase=false will map these to snake_case column names,
 * but the TypeScript properties will use the property names defined here.
 */

import { pgTable, serial, text, numeric, timestamp } from "drizzle-orm/pg-core";

export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  source: text("source").notNull(), // Store name, marketplace, etc.
  product_link: text("product_link").notNull(), // URL to product page
  image_url: text("image_url").notNull(), // Product image URL
  price: numeric("price", { precision: 10, scale: 2 }).notNull(), // Current/sale price
  original_price: numeric("original_price", { precision: 10, scale: 2 }), // Original price before discount
  discount_percent: numeric("discount_percent", { precision: 5, scale: 2 }), // Calculated discount %
  currency: text("currency").notNull().default("USD"), // Currency code (USD, EUR, etc.)
  search_query: text("search_query").notNull(), // Original user search query
  category: text("category"), // Optional category for filtering
  created_at: timestamp("created_at").notNull().defaultNow(), // When deal was added to DB
});

// Export TypeScript types for type safety
// Note: These will use the property names defined above (snake_case)
export type Deal = typeof deals.$inferSelect;
export type NewDeal = typeof deals.$inferInsert;

