/**
 * POST /api/agent
 * 
 * Generates an AI-powered search plan using OpenAI GPT.
 * This endpoint is used by the search form to provide users with
 * a clear plan of how the search will be conducted.
 * 
 * Request Body:
 *   - sites: string[] (required) - Array of shopping site names/URLs
 *   - minDiscount: number (required) - Minimum discount percentage (0-100)
 *   - maxDiscount: number (required) - Maximum discount percentage (0-100)
 *   - keywords: string (optional) - Product keywords to filter by
 * 
 * Response:
 *   - plan: string - AI-generated search plan description
 *   - debugInfo: object - Debug information about the request
 */

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Request body type
interface AgentRequest {
  sites: string[]
  minDiscount: number
  maxDiscount: number
  keywords?: string
}

// Response type
interface AgentResponse {
  plan: string
  debugInfo: {
    receivedParams: AgentRequest
    sitesCount: number
    discountRange: string
    hasKeywords: boolean
    timestamp: string
  }
}

// Error response type
interface ErrorResponse {
  error: string
  details?: string
}

export async function POST(request: NextRequest) {
  try {
    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'OpenAI API key not configured',
          details: 'Please set OPENAI_API_KEY in your environment variables'
        } as ErrorResponse,
        { status: 500 }
      )
    }

    // Parse request body
    let body: AgentRequest
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Invalid JSON in request body',
          details: error instanceof Error ? error.message : 'Unknown error'
        } as ErrorResponse,
        { status: 400 }
      )
    }

    // Validate required fields
    if (!body.sites || !Array.isArray(body.sites) || body.sites.length === 0) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: 'sites must be a non-empty array of URLs'
        } as ErrorResponse,
        { status: 400 }
      )
    }

    if (typeof body.minDiscount !== 'number' || typeof body.maxDiscount !== 'number') {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: 'minDiscount and maxDiscount must be numbers'
        } as ErrorResponse,
        { status: 400 }
      )
    }

    if (body.minDiscount < 0 || body.maxDiscount > 100 || body.minDiscount > body.maxDiscount) {
      return NextResponse.json(
        {
          error: 'Invalid discount range',
          details: 'Discount must be between 0-100% and min must be <= max'
        } as ErrorResponse,
        { status: 400 }
      )
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey
    })

    // Create prompt for OpenAI
    const prompt = `You are a shopping deal finder assistant. Based on the following search parameters, create a detailed plan for finding deals.

Search Parameters:
- Sites to check: ${body.sites.join(', ')}
- Minimum discount: ${body.minDiscount}%
- Maximum discount: ${body.maxDiscount}%
${body.keywords ? `- Keywords/Product type: ${body.keywords}` : '- No specific keywords'}

Please provide a concise, structured plan that includes:
1. Which sites will be checked
2. What discount filters will be applied
3. What product keywords (if any) will be used to filter results
4. The expected approach for finding these deals

Keep the response clear, friendly, and under 200 words.`

    // Call OpenAI API
    let plan: string
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful shopping assistant that helps users find the best deals online. Respond in a clear, structured manner.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })

      plan = completion.choices[0]?.message?.content || 'No plan generated'
    } catch (error) {
      return NextResponse.json(
        {
          error: 'OpenAI API error',
          details: error instanceof Error ? error.message : 'Failed to generate plan'
        } as ErrorResponse,
        { status: 500 }
      )
    }

    // Prepare debug info
    const debugInfo = {
      receivedParams: body,
      sitesCount: body.sites.length,
      discountRange: `${body.minDiscount}% - ${body.maxDiscount}%`,
      hasKeywords: !!body.keywords,
      timestamp: new Date().toISOString()
    }

    // Return response
    const response: AgentResponse = {
      plan,
      debugInfo
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Unexpected error in /api/agent:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'An unexpected error occurred'
      } as ErrorResponse,
      { status: 500 }
    )
  }
}

