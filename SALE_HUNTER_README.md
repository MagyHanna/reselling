# Sale Hunter - UI Documentation

## Overview
The Sale Hunter is an AI-powered research agent that scans multiple shopping sites to find the best deals and discounts. The UI is built with Next.js 15, React, and shadcn/ui components.

## Features Implemented

### 1. **Search Form** (`components/search-form.tsx`)
- **URL Input**: Textarea for entering multiple shopping site URLs (one per line)
- **Keyword Filter**: Optional text input for product type or keyword search
- **Discount Slider**: Adjustable slider (0-90%) to set minimum discount percentage
- **Submit Button**: Triggers the search with loading state
- **Validation**: Disabled submit when no URLs are entered

### 2. **Results Display** (`components/results-table.tsx`)
- **Loading State**: Animated spinner with loading message
- **Empty State**: Helpful message when no results are available
- **Desktop Table View**: Full-featured table with sortable columns
- **Mobile Card View**: Responsive card layout for small screens
- **Deal Information**: Shows site, product title, prices, discount %, and action button
- **Statistics**: Summary cards showing deals found, average discount, and total savings

### 3. **Main Page** (`app/page.tsx`)
- **Responsive Layout**: 
  - Mobile: Stacked layout
  - Desktop: Sidebar form + main results area
- **Sticky Sidebar**: Form stays visible while scrolling on large screens
- **Mock Data**: 8 sample deals for testing
- **State Management**: React hooks for results and loading states

## File Structure

```
app/
├── page.tsx                    # Main Sale Hunter page
components/
├── search-form.tsx            # Search form component
├── results-table.tsx          # Results display component
└── ui/                        # shadcn/ui components
    ├── button.tsx
    ├── card.tsx
    ├── input.tsx
    ├── label.tsx
    ├── slider.tsx
    ├── table.tsx
    └── textarea.tsx
```

## Components API

### SearchForm
```typescript
interface SearchFormProps {
  onSearch: (params: SearchParams) => void
  isLoading: boolean
}

interface SearchParams {
  urls: string[]
  keyword: string
  minDiscount: number
}
```

### ResultsTable
```typescript
interface ResultsTableProps {
  results: DealResult[]
  isLoading: boolean
}

interface DealResult {
  id: string
  site: string
  productTitle: string
  originalPrice: number
  salePrice: number
  discountPercent: number
  productUrl: string
}
```

## Integrating Real API

Currently, the app uses mock data. To integrate with a real API endpoint:

### 1. Create API Route
Create `app/api/search-deals/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { urls, keyword, minDiscount } = body

  // Your deal-finding logic here
  // This could involve:
  // - Web scraping
  // - External API calls
  // - Database queries
  // - AI/LLM processing

  const deals = await findDeals({ urls, keyword, minDiscount })

  return NextResponse.json({ deals, success: true })
}
```

### 2. Update handleSearch in page.tsx

Replace the mock implementation with:

```typescript
const handleSearch = async (params: SearchParams) => {
  setIsLoading(true)
  setResults([])

  try {
    const response = await fetch('/api/search-deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    })

    if (!response.ok) {
      throw new Error('Search failed')
    }

    const data = await response.json()
    setResults(data.deals)
  } catch (error) {
    console.error('Search error:', error)
    // Handle error (show toast, error message, etc.)
  } finally {
    setIsLoading(false)
  }
}
```

## Responsive Breakpoints

- **Mobile**: < 768px (md breakpoint)
  - Stacked layout
  - Card-based results view
  - Full-width form

- **Tablet**: 768px - 1024px
  - Two-column grid starts at lg (1024px)
  - Table view enabled

- **Desktop**: > 1024px
  - Sidebar (400-450px) + Main content
  - Sticky form sidebar
  - Full table view with all columns

## Styling

Built with Tailwind CSS v4 and shadcn/ui:
- **Color Scheme**: Supports light/dark mode automatically
- **Primary Colors**: Using CSS variables from theme
- **Animations**: Loading spinner, hover states, transitions
- **Typography**: Gradient text for hero heading
- **Shadows & Borders**: Consistent card styling

## Future Enhancements

Potential improvements:
1. **Sorting & Filtering**: Add column sorting, multi-filter support
2. **Export Results**: Download deals as CSV/JSON
3. **Save Searches**: User accounts and saved search criteria
4. **Notifications**: Email alerts for new deals
5. **Price History**: Track price changes over time
6. **Comparison View**: Side-by-side product comparison
7. **Favorites**: Save interesting deals for later
8. **Share Links**: Generate shareable deal collections

## Running the App

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start
```

Access at: http://localhost:3000

## Dependencies

- Next.js 15
- React 19
- Tailwind CSS v4
- shadcn/ui components
- lucide-react (icons)
- TypeScript

## Notes

- All components are client-side (`"use client"`) for interactivity
- Form validation is built-in
- Mock data filtering demonstrates search logic
- Responsive design tested at multiple breakpoints
- Accessibility features included (labels, ARIA attributes)

