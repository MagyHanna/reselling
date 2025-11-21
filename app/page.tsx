"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { Deal, DealsSearchResponse, DealsAnalyzeResponse } from "@/types/deals"

export default function Home() {
  // Search state
  const [query, setQuery] = useState("")
  const [minDiscount, setMinDiscount] = useState(20)
  const [deals, setDeals] = useState<Deal[]>([])
  const [dealsLoading, setDealsLoading] = useState(false)
  const [dealsError, setDealsError] = useState<string | null>(null)

  // Analysis state
  const [question, setQuestion] = useState("")
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  // Fetch deals from API
  const handleSearchDeals = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!query.trim()) {
      setDealsError("Please enter a search query")
      return
    }

    setDealsLoading(true)
    setDealsError(null)
    setDeals([])

    try {
      const response = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, minDiscount }),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch deals: ${response.statusText}`)
      }

      const data: DealsSearchResponse = await response.json()
      setDeals(data.deals)
    } catch (error) {
      setDealsError(error instanceof Error ? error.message : "Failed to fetch deals")
    } finally {
      setDealsLoading(false)
    }
  }

  // Analyze deals with RAG
  const handleAnalyzeDeals = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!question.trim()) {
      setAnalysisError("Please enter a question")
      return
    }

    setAnalysisLoading(true)
    setAnalysisError(null)
    setAnalysis(null)

    try {
      const response = await fetch("/api/analyze-deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, query, minDiscount }),
      })

      if (!response.ok) {
        throw new Error(`Failed to analyze deals: ${response.statusText}`)
      }

      const data: DealsAnalyzeResponse = await response.json()
      setAnalysis(data.answer)
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "Failed to analyze deals")
    } finally {
      setAnalysisLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-8 md:mb-12 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Sale Hunter AI
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered deal finder that scans shopping sites and provides intelligent insights on the best discounts
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search for Deals</CardTitle>
            <CardDescription>
              Enter a product or category and set minimum discount percentage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearchDeals} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="query">Search Query</Label>
                <Input
                  id="query"
                  placeholder="e.g., wireless headphones, laptop, running shoes"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={dealsLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minDiscount">
                  Minimum Discount: {minDiscount}%
                </Label>
                <Slider
                  id="minDiscount"
                  min={0}
                  max={100}
                  step={5}
                  value={[minDiscount]}
                  onValueChange={(value) => setMinDiscount(value[0])}
                  disabled={dealsLoading}
                  className="py-4"
                />
              </div>

              <Button type="submit" disabled={dealsLoading} className="w-full">
                {dealsLoading ? "Searching..." : "Search Deals"}
              </Button>

              {dealsError && (
                <p className="text-sm text-destructive">{dealsError}</p>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            {deals.length > 0 ? `Found ${deals.length} Deals` : "Results"}
          </h2>

          {dealsLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-muted rounded w-full mb-2" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!dealsLoading && deals.length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <p className="text-muted-foreground text-center">
                  No deals found. Try searching for products above.
                </p>
              </CardContent>
            </Card>
          )}

          {!dealsLoading && deals.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deals.map((deal, index) => (
                <Card key={index} className="overflow-hidden flex flex-col">
                  {/* Product Image */}
                  <div className="aspect-video relative bg-muted">
                    {deal.imageUrl ? (
                      <img
                        src={deal.imageUrl}
                        alt={deal.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>

                  <CardHeader className="flex-grow">
                    {/* Title with 2-line clamp */}
                    <CardTitle className="text-base line-clamp-2 leading-tight">
                      {deal.title}
                    </CardTitle>
                    
                    {/* Source */}
                    <CardDescription className="text-xs">
                      {deal.source}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Pricing */}
                    <div className="flex items-baseline gap-2">
                      {deal.price !== null && (
                        <span className="text-2xl font-bold">
                          {deal.currency}{deal.price.toFixed(2)}
                        </span>
                      )}
                      {deal.originalPrice !== null && deal.originalPrice !== deal.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {deal.currency}{deal.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Discount Badge */}
                    {deal.discountPercent !== null && deal.discountPercent > 0 && (
                      <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                        {deal.discountPercent}% OFF
                      </Badge>
                    )}

                    {/* View Product Link */}
                    <a
                      href={deal.productLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button variant="outline" className="w-full">
                        View Product →
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* RAG Analysis Section */}
        <Card>
          <CardHeader>
            <CardTitle>AI Deal Analysis</CardTitle>
            <CardDescription>
              Ask questions about the deals and get AI-powered insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAnalyzeDeals} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question">Your Question</Label>
                <Textarea
                  id="question"
                  placeholder="e.g., Which deal offers the best value for money? What are the top 3 deals?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={analysisLoading}
                  rows={3}
                />
              </div>

              <Button type="submit" disabled={analysisLoading || deals.length === 0}>
                {analysisLoading ? "Analyzing..." : "Analyze Deals"}
              </Button>

              {deals.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Search for deals first to enable AI analysis
                </p>
              )}

              {analysisError && (
                <p className="text-sm text-destructive">{analysisError}</p>
              )}

              {analysis && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">AI Analysis:</h3>
                  <p className="text-sm whitespace-pre-wrap">{analysis}</p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
