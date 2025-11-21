"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Search, Sparkles, AlertCircle } from "lucide-react"

interface SearchFormProps {
  onSearch: (params: SearchParams) => void
  isLoading: boolean
}

export interface SearchParams {
  shopNames: string[]
  keyword: string
  minDiscount: number
  maxDiscount: number
}

interface AgentPlan {
  plan: string
  debugInfo: {
    receivedParams: {
      sites: string[]
      minDiscount: number
      maxDiscount: number
      keywords?: string
    }
    sitesCount: number
    discountRange: string
    hasKeywords: boolean
    timestamp: string
  }
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [shopNames, setShopNames] = useState("")
  const [keyword, setKeyword] = useState("")
  const [minDiscount, setMinDiscount] = useState([20])
  const [maxDiscount, setMaxDiscount] = useState([100])
  const [agentPlan, setAgentPlan] = useState<AgentPlan | null>(null)
  const [planError, setPlanError] = useState<string | null>(null)
  const [isLoadingPlan, setIsLoadingPlan] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const shopNameList = shopNames
      .split("\n")
      .map(name => name.trim())
      .filter(name => name.length > 0)

    // Reset states
    setAgentPlan(null)
    setPlanError(null)
    setIsLoadingPlan(true)

    try {
      // Call the agent API
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sites: shopNameList,
          minDiscount: minDiscount[0],
          maxDiscount: maxDiscount[0],
          keywords: keyword || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate plan')
      }

      setAgentPlan(data)
      
      // Continue with the original search
      onSearch({
        shopNames: shopNameList,
        keyword,
        minDiscount: minDiscount[0],
        maxDiscount: maxDiscount[0]
      })
    } catch (error) {
      setPlanError(error instanceof Error ? error.message : 'Failed to generate plan')
      console.error('Error calling agent API:', error)
    } finally {
      setIsLoadingPlan(false)
    }
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Sale Hunter Search
          </CardTitle>
          <CardDescription>
            Enter shop names to search for the best deals and discounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="shopNames">Shop Name</Label>
            <Textarea
              id="shopNames"
              placeholder="Nike&#10;Amazon&#10;Best Buy&#10;Target"
              value={shopNames}
              onChange={(e) => setShopNames(e.target.value)}
              rows={6}
              className="text-sm"
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              Enter one shop name per line
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keyword">Product Type or Keyword (Optional)</Label>
            <Input
              id="keyword"
              type="text"
              placeholder="e.g., shoes, electronics, laptop"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="discount">Discount Range</Label>
              <span className="text-sm font-medium">{minDiscount[0]}% - {maxDiscount[0]}%</span>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="minDiscount" className="text-xs text-muted-foreground">Minimum</Label>
                <Slider
                  id="minDiscount"
                  min={0}
                  max={90}
                  step={5}
                  value={minDiscount}
                  onValueChange={setMinDiscount}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
              
              <div>
                <Label htmlFor="maxDiscount" className="text-xs text-muted-foreground">Maximum</Label>
                <Slider
                  id="maxDiscount"
                  min={10}
                  max={100}
                  step={5}
                  value={maxDiscount}
                  onValueChange={setMaxDiscount}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Quick Select Ranges:</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { min: 90, max: 100, label: "90%-100%" },
                  { min: 80, max: 90, label: "80%-90%" },
                  { min: 70, max: 80, label: "70%-80%" },
                  { min: 60, max: 70, label: "60%-70%" },
                  { min: 50, max: 60, label: "50%-60%" },
                  { min: 40, max: 50, label: "40%-50%" },
                  { min: 30, max: 40, label: "30%-40%" },
                  { min: 20, max: 30, label: "20%-30%" },
                  { min: 10, max: 20, label: "10%-20%" },
                ].map((range) => (
                  <Button
                    key={range.label}
                    type="button"
                    variant={minDiscount[0] === range.min && maxDiscount[0] === range.max ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setMinDiscount([range.min])
                      setMaxDiscount([range.max])
                    }}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Show deals between {minDiscount[0]}% and {maxDiscount[0]}% off
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isLoading || isLoadingPlan || shopNames.trim().length === 0}
          >
            {isLoadingPlan ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                Generating Plan...
              </>
            ) : isLoading ? (
              <>
                <span className="animate-spin mr-2">⚡</span>
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Run Search
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>

    {/* AI Plan Card */}
    {agentPlan && (
      <Card className="w-full mt-4 border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Search Plan
          </CardTitle>
          <CardDescription>
            Generated by AI based on your search criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-sm leading-relaxed whitespace-pre-line">
              {agentPlan.plan}
            </p>
          </div>
          
          {/* Debug Info - Optional, can be hidden in production */}
          <details className="mt-4 text-xs text-muted-foreground">
            <summary className="cursor-pointer hover:text-foreground">
              Debug Information
            </summary>
            <div className="mt-2 p-3 bg-muted rounded-md">
              <pre className="overflow-x-auto">
                {JSON.stringify(agentPlan.debugInfo, null, 2)}
              </pre>
            </div>
          </details>
        </CardContent>
      </Card>
    )}

    {/* Error Card */}
    {planError && (
      <Card className="w-full mt-4 border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            {planError}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Check that your OPENAI_API_KEY environment variable is set correctly.
          </p>
        </CardContent>
      </Card>
    )}
    </>
  )
}

