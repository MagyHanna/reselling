"use client"

import { useState } from "react"
import { SearchForm, type SearchParams } from "@/components/search-form"
import { ResultsTable, type DealResult } from "@/components/results-table"

// Mock data - replace with actual API call later
const MOCK_DEALS: DealResult[] = [
  {
    id: "1",
    site: "TechStore.com",
    productTitle: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    originalPrice: 399.99,
    salePrice: 279.99,
    discountPercent: 30,
    productUrl: "https://example.com/product1"
  },
  {
    id: "2",
    site: "ElectroDeals.com",
    productTitle: "Apple AirPods Pro (2nd Generation) with MagSafe Charging Case",
    originalPrice: 249.99,
    salePrice: 199.99,
    discountPercent: 20,
    productUrl: "https://example.com/product2"
  },
  {
    id: "3",
    site: "GadgetWorld.com",
    productTitle: "Samsung 65\" QLED 4K Smart TV - QN65Q80C",
    originalPrice: 1499.99,
    salePrice: 899.99,
    discountPercent: 40,
    productUrl: "https://example.com/product3"
  },
  {
    id: "4",
    site: "HomeEssentials.com",
    productTitle: "Dyson V15 Detect Cordless Vacuum Cleaner",
    originalPrice: 749.99,
    salePrice: 524.99,
    discountPercent: 30,
    productUrl: "https://example.com/product4"
  },
  {
    id: "5",
    site: "FashionHub.com",
    productTitle: "Nike Air Max 270 React Running Shoes - Men's",
    originalPrice: 160.00,
    salePrice: 95.99,
    discountPercent: 40,
    productUrl: "https://example.com/product5"
  },
  {
    id: "6",
    site: "TechStore.com",
    productTitle: "MacBook Air 13\" M2 Chip, 8GB RAM, 256GB SSD",
    originalPrice: 1199.00,
    salePrice: 949.00,
    discountPercent: 21,
    productUrl: "https://example.com/product6"
  },
  {
    id: "7",
    site: "SportingGoods.com",
    productTitle: "Peloton Bike+ Indoor Exercise Bike with Auto-Follow",
    originalPrice: 2495.00,
    salePrice: 1745.00,
    discountPercent: 30,
    productUrl: "https://example.com/product7"
  },
  {
    id: "8",
    site: "BeautyStore.com",
    productTitle: "Dyson Airwrap Complete Hair Styler - Limited Edition",
    originalPrice: 599.99,
    salePrice: 479.99,
    discountPercent: 20,
    productUrl: "https://example.com/product8"
  }
]

export default function Home() {
  const [results, setResults] = useState<DealResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (params: SearchParams) => {
    setIsLoading(true)
    setResults([])

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // TODO: Replace with actual API call
    // const response = await fetch('/api/search-deals', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(params)
    // })
    // const data = await response.json()
    // setResults(data.deals)

    // Mock filtering based on search params
    let filteredDeals = [...MOCK_DEALS]

    // Filter by discount range
    filteredDeals = filteredDeals.filter(
      deal => deal.discountPercent >= params.minDiscount && deal.discountPercent <= params.maxDiscount
    )

    // Filter by keyword if provided
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      filteredDeals = filteredDeals.filter(deal =>
        deal.productTitle.toLowerCase().includes(keyword) ||
        deal.site.toLowerCase().includes(keyword)
      )
    }

    // Simulate filtering by shop names (in real app, this would be server-side)
    if (params.shopNames.length > 0) {
      // For now, just return filtered deals
      // In production, you'd only return deals from the specified shop names
    }

    setResults(filteredDeals)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 md:mb-12 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Sale Hunter
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered deal finder that scans multiple shopping sites to find the best discounts and sales
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-[400px_1fr] xl:grid-cols-[450px_1fr] items-start">
          {/* Search Form - Sidebar */}
          <div className="lg:sticky lg:top-8">
            <SearchForm onSearch={handleSearch} isLoading={isLoading} />
          </div>

          {/* Results Section */}
          <div className="min-h-[400px]">
            <ResultsTable results={results} isLoading={isLoading} />
          </div>
        </div>

        {/* Stats Footer */}
        {results.length > 0 && !isLoading && (
          <div className="mt-8 grid gap-4 sm:grid-cols-3 max-w-3xl mx-auto">
            <div className="bg-card rounded-lg border p-4 text-center">
              <div className="text-3xl font-bold text-primary">
                {results.length}
              </div>
              <div className="text-sm text-muted-foreground">Deals Found</div>
            </div>
            <div className="bg-card rounded-lg border p-4 text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {Math.round(results.reduce((sum, deal) => sum + deal.discountPercent, 0) / results.length)}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Discount</div>
            </div>
            <div className="bg-card rounded-lg border p-4 text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                ${results.reduce((sum, deal) => sum + (deal.originalPrice - deal.salePrice), 0).toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Savings</div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
