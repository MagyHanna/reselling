/**
 * POST /api/analyze-deals
 * 
 * Uses RAG (Retrieval-Augmented Generation) to analyze deals from the database
 * and answer user questions using OpenAI's GPT model.
 * 
 * Behavior:
 *   1. Queries the database for deals matching the filters (query, minDiscount)
 *   2. Retrieves up to 50 most discounted deals
 *   3. Sends the deals context to OpenAI with the user's question
 *   4. Returns AI-generated analysis and insights
 * 
 * Request Body:
 *   - question: string (required, min 5 chars) - User's question about deals
 *   - query: string (optional) - Filter deals by search query
 *   - minDiscount: number (optional) - Filter by minimum discount (0-100)
 * 
 * Response:
 *   - answer: string - AI-generated answer to the question
 *   - dealsAnalyzed: number - Number of deals used for analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { deals } from '@/schema/deals';
import { and, desc, gte, ilike, or } from 'drizzle-orm';
import OpenAI from 'openai';

// ============================================================================
// Request Validation Schema
// ============================================================================

const analyzeDealsRequestSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters long'),
  query: z.string().optional(),
  minDiscount: z.number().min(0).max(100).optional(),
});

type AnalyzeDealsRequest = z.infer<typeof analyzeDealsRequestSchema>;

// ============================================================================
// OpenAI Client Initialization
// ============================================================================

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
  }

  return new OpenAI({ apiKey });
}

// ============================================================================
// POST Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData: AnalyzeDealsRequest = analyzeDealsRequestSchema.parse(body);

    const { question, query, minDiscount } = validatedData;

    // Build query filters
    const filters = [];
    
    if (query) {
      // Filter by title OR search_query using ILIKE (case-insensitive)
      filters.push(
        or(
          ilike(deals.title, `%${query}%`),
          ilike(deals.search_query, `%${query}%`)
        )
      );
    }
    
    if (minDiscount !== undefined) {
      // Filter by discount percentage >= minDiscount
      filters.push(gte(deals.discount_percent, minDiscount.toString()));
    }

    // Query deals from database
    let relevantDeals;
    try {
      relevantDeals = await db
        .select()
        .from(deals)
        .where(filters.length > 0 ? and(...filters) : undefined)
        .orderBy(desc(deals.discount_percent))
        .limit(50);
    } catch (error) {
      console.error('Database query error:', error);
      return NextResponse.json(
        {
          error: 'Failed to query deals from database',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    // Check if any deals were found
    if (relevantDeals.length === 0) {
      return NextResponse.json(
        {
          answer: "I couldn't find any deals matching your filters. Try running a search first or adjust your filters.",
        },
        { status: 200 }
      );
    }

    // Build compact context string for OpenAI
    // Note: Database returns snake_case field names
    const contextLines = relevantDeals.map((deal, index) => {
      const discountText = deal.discount_percent 
        ? `${deal.discount_percent}% off` 
        : 'No discount';
      const originalPriceText = deal.original_price 
        ? `(was ${deal.currency} ${deal.original_price})` 
        : '';
      
      return `${index + 1}. ${deal.title} - ${deal.source} - ${deal.currency} ${deal.price} ${originalPriceText} ${discountText} - ${deal.product_link}`;
    });

    const dealsContext = contextLines.join('\n');

    // Call OpenAI API
    let answer: string;
    try {
      const openai = getOpenAIClient();
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a shopping deals analyst. Your job is to analyze deals data and provide concise, helpful answers to user questions. Use bullet points for clarity and be specific about products, prices, and discounts.',
          },
          {
            role: 'user',
            content: `Question: ${question}\n\nHere are the relevant deals:\n\n${dealsContext}\n\nPlease provide a concise, bullet-pointed answer based on these deals.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      answer = completion.choices[0]?.message?.content || 'Unable to generate an answer.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        {
          error: 'Failed to analyze deals with OpenAI',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    // Return the answer
    return NextResponse.json(
      {
        answer,
        dealsAnalyzed: relevantDeals.length,
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
    console.error('Unexpected error in POST /api/analyze-deals:', error);
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

