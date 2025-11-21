/**
 * SerpAPI Google Shopping Helper
 * 
 * This module provides functionality to query SerpAPI's Google Shopping engine
 * and normalize the results into a consistent deal format.
 * 
 * Environment Variables Required:
 *   - SERPAPI_API_KEY: Your SerpAPI API key (get from https://serpapi.com)
 * 
 * Key Functions:
 *   - fetchShoppingDealsFromSerpapi(): Fetches and normalizes shopping deals
 *   - computeDiscountPercent(): Calculates discount percentage
 *   - normalizeSerpAPIResult(): Converts SerpAPI format to internal Deal type
 */

import { Deal, ShoppingDealOptions } from '@/types/deals';

// ============================================================================
// Types
// ============================================================================

interface SerpAPIShoppingResult {
  position?: number;
  title?: string;
  link?: string;
  product_link?: string;
  product_id?: string;
  serpapi_product_api?: string;
  source?: string;
  price?: string;
  extracted_price?: number;
  old_price?: string;
  extracted_old_price?: number;
  thumbnail?: string;
  delivery?: string;
  rating?: number;
  reviews?: number;
  extensions?: string[];
  second_hand_condition?: string;
}

interface SerpAPIResponse {
  shopping_results?: SerpAPIShoppingResult[];
  error?: string;
}

// ============================================================================
// Constants
// ============================================================================

const SERPAPI_BASE_URL = 'https://serpapi.com/search';
const DEFAULT_LIMIT = 30;
const DEFAULT_CURRENCY = 'USD';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Computes the discount percentage between original and current price
 */
function computeDiscountPercent(
  price: number | null,
  originalPrice: number | null
): number | null {
  if (
    price === null ||
    originalPrice === null ||
    originalPrice <= price ||
    originalPrice === 0
  ) {
    return null;
  }

  const discount = ((originalPrice - price) / originalPrice) * 100;
  return Math.round(discount);
}

/**
 * Normalizes a single SerpAPI shopping result into our internal format
 */
function normalizeSerpAPIResult(
  result: SerpAPIShoppingResult
): Deal {
  const price = result.extracted_price ?? null;
  const originalPrice = result.extracted_old_price ?? null;
  const discountPercent = computeDiscountPercent(price, originalPrice);

  return {
    title: result.title || 'Untitled Product',
    source: result.source || 'Unknown Source',
    productLink: result.product_link || result.link || '',
    imageUrl: result.thumbnail || '',
    price,
    originalPrice,
    discountPercent,
    currency: DEFAULT_CURRENCY,
  };
}

// ============================================================================
// Main Export
// ============================================================================

/**
 * Fetches shopping deals from SerpAPI's Google Shopping engine
 * 
 * @param options - Query options including search term, limit, and optional category
 * @returns Array of normalized deal objects
 * @throws Error if SERPAPI_API_KEY is not set or if the API request fails
 * 
 * @example
 * ```ts
 * const deals = await fetchShoppingDealsFromSerpapi({
 *   query: 'iPhone 15 Pro',
 *   limit: 20,
 *   category: 'electronics'
 * });
 * ```
 */
export async function fetchShoppingDealsFromSerpapi(
  options: ShoppingDealOptions
): Promise<Deal[]> {
  const { query, limit = DEFAULT_LIMIT, category } = options;

  // Validate API key
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'SERPAPI_API_KEY is not set. Please configure this environment variable to use the SerpAPI integration.'
    );
  }

  // Build query parameters
  const params = new URLSearchParams({
    engine: 'google_shopping',
    q: query,
    num: limit.toString(),
    hl: 'en',
    gl: 'us',
    api_key: apiKey,
  });

  // Note: category parameter is accepted but not used by this API call yet
  // It can be incorporated into the query string or used for filtering later
  if (category) {
    // Future enhancement: could append to query or use for post-filtering
  }

  // Make API request
  const url = `${SERPAPI_BASE_URL}?${params.toString()}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `SerpAPI request failed with status ${response.status}: ${errorText}`
      );
    }

    const data: SerpAPIResponse = await response.json();

    // Check for API-level errors
    if (data.error) {
      throw new Error(`SerpAPI error: ${data.error}`);
    }

    // Extract and normalize shopping results
    const shoppingResults = data.shopping_results || [];
    const normalizedDeals = shoppingResults.map(normalizeSerpAPIResult);

    return normalizedDeals;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch shopping deals: ${error.message}`);
    }
    throw new Error('Failed to fetch shopping deals: Unknown error');
  }
}

