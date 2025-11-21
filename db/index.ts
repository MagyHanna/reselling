/**
 * Database Connection Setup
 * 
 * Configures the Neon PostgreSQL database connection using Drizzle ORM.
 * 
 * Environment Variables Required:
 *   - DATABASE_URL: PostgreSQL connection string from Neon
 * 
 * Usage:
 *   import { db } from '@/db';
 *   const results = await db.select().from(deals);
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../schema";

// Validate DATABASE_URL exists at initialization
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Please add it to your .env.local file."
  );
}

// Create the Neon SQL client
const sql = neon(process.env.DATABASE_URL);

// Create the Drizzle database instance with schema
export const db = drizzle(sql, { schema });

// Export useful types
export type DbType = typeof db;

