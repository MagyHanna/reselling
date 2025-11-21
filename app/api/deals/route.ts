/**
 * POST /api/deals
 * 
 * Fetches shopping deals from SerpAPI based on search criteria,
 * filters them by minimum discount, and stores them in the database.
 * 
 * Request Body:
 *   - query: string (required) - Search query for products
 *   - category: string (optional) - Category filter
 *   - minDiscount: number (optional) - Minimum discount percentage (0-100)
 *   - limit: number (optional) - Max results to fetch (1-100, default: 30)
 * 
 * Response:
 *   - deals: Deal[] - Array of deals matching criteria
 *   - count: number - Number of filtered deals returned
 *   - totalFetched: number - Total deals fetched from API before filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { fetchShoppingDealsFromSerpapi } from '@/lib/serpapi';
import { Deal } from '@/types/deals';
import { db } from '@/db';
import { deals } from '@/schema/deals';

// ============================================================================
// Request Validation Schema
// ============================================================================

const dealsRequestSchema = z.object({
  query: z.string().min(1, 'Query is required and cannot be empty'),
  category: z.string().optional(),
  minDiscount: z.number().min(0).max(100).optional(),
  limit: z.number().min(1).max(100).default(30),
});

type DealsRequest = z.infer<typeof dealsRequestSchema>;

// ============================================================================
// POST Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData: DealsRequest = dealsRequestSchema.parse(body);

    const { query, category, minDiscount, limit } = validatedData;

    // Fetch deals from SerpAPI
    let fetchedDeals: Deal[];
    try {
      fetchedDeals = await fetchShoppingDealsFromSerpapi({
        query,
        limit,
        category,
      });
    } catch (error) {
      console.error('SerpAPI fetch error:', error);
      return NextResponse.json(
        {
          error: 'Failed to fetch deals from SerpAPI',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    // Filter deals by minimum discount if specified
    let filteredDeals = fetchedDeals;
    if (minDiscount !== undefined) {
      filteredDeals = fetchedDeals.filter((deal) => {
        return (
          deal.discountPercent !== null && deal.discountPercent >= minDiscount
        );
      });
    }

    // Insert filtered deals into the database
    // Note: Schema uses snake_case column names (product_link, image_url)
    if (filteredDeals.length > 0) {
      try {
        const dealsToInsert = filteredDeals.map((deal) => ({
          title: deal.title,
          source: deal.source,
          product_link: deal.productLink, // Fixed: Use snake_case to match schema
          image_url: deal.imageUrl, // Fixed: Use snake_case to match schema
          price: deal.price?.toString() ?? '0',
          original_price: deal.originalPrice?.toString() ?? null, // Fixed: Use snake_case
          discount_percent: deal.discountPercent?.toString() ?? null, // Fixed: Use snake_case
          currency: deal.currency,
          search_query: query, // Fixed: Use snake_case
          category: category ?? null,
        }));

        await db.insert(deals).values(dealsToInsert);
      } catch (error) {
        console.error('Database insert error:', error);
        return NextResponse.json(
          {
            error: 'Failed to store deals in database',
            details: error instanceof Error ? error.message : 'Unknown error',
          },
          { status: 500 }
        );
      }
    }

    // Return the filtered deals
    return NextResponse.json(
      {
        deals: filteredDeals,
        count: filteredDeals.length,
        totalFetched: fetchedDeals.length,
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: 'Invalid JSON in request body',
        },
        { status: 400 }
      );
    }

    // Handle unexpected errors
    console.error('Unexpected error in POST /api/deals:', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        details:
          process.env.NODE_ENV === 'development' && error instanceof Error
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}

