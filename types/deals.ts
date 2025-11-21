/**
 * Shared TypeScript types for deals across the application
 * This ensures consistency between API routes, libraries, and components
 */

// ============================================================================
// Core Deal Type
// ============================================================================

/**
 * Normalized deal shape returned by the API and used throughout the application
 */
export interface Deal {
  title: string;
  source: string;
  productLink: string;
  imageUrl: string;
  price: number | null;
  originalPrice: number | null;
  discountPercent: number | null;
  currency: string;
}

// ============================================================================
// API Request Types
// ============================================================================

/**
 * Request payload for searching deals via /api/deals
 */
export interface DealsSearchRequest {
  query: string;
  category?: string;
  minDiscount?: number;
  limit?: number;
}

/**
 * Response from /api/deals
 */
export interface DealsSearchResponse {
  deals: Deal[];
  count: number;
  totalFetched: number;
}

/**
 * Request payload for analyzing deals via /api/analyze-deals
 */
export interface DealsAnalyzeRequest {
  question: string;
  query?: string;
  minDiscount?: number;
}

/**
 * Response from /api/analyze-deals
 */
export interface DealsAnalyzeResponse {
  answer: string;
  dealsAnalyzed: number;
}

// ============================================================================
// Search Options
// ============================================================================

/**
 * Options for fetching shopping deals from external APIs
 */
export interface ShoppingDealOptions {
  query: string;
  limit?: number;
  category?: string;
}

