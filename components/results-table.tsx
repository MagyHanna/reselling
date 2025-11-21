"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ExternalLink, TrendingDown } from "lucide-react"

export interface DealResult {
  id: string
  site: string
  productTitle: string
  originalPrice: number
  salePrice: number
  discountPercent: number
  productUrl: string
}

interface ResultsTableProps {
  results: DealResult[]
  isLoading: boolean
}

export function ResultsTable({ results, isLoading }: ResultsTableProps) {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
          <CardDescription>Finding the best deals for you...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
            </div>
            <p className="text-muted-foreground animate-pulse">
              Scanning websites for deals...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (results.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
          <CardDescription>No deals found yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
            <TrendingDown className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Enter shopping URLs and run a search to find amazing deals!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Search Results</CardTitle>
        <CardDescription>
          Found {results.length} deal{results.length !== 1 ? "s" : ""} matching your criteria
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Original Price</TableHead>
                <TableHead className="text-right">Sale Price</TableHead>
                <TableHead className="text-right">Discount</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((deal) => (
                <TableRow key={deal.id}>
                  <TableCell className="font-medium">{deal.site}</TableCell>
                  <TableCell className="max-w-md">
                    <div className="line-clamp-2">{deal.productTitle}</div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground line-through">
                    ${deal.originalPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-green-600 dark:text-green-400">
                    ${deal.salePrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-300">
                      <TrendingDown className="mr-1 h-3 w-3" />
                      {deal.discountPercent}% OFF
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={deal.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center"
                      >
                        View Deal
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Mobile-friendly card view for small screens */}
        <div className="md:hidden space-y-4 mt-4">
          {results.map((deal) => (
            <Card key={deal.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{deal.productTitle}</CardTitle>
                  <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-800 dark:text-green-300 whitespace-nowrap ml-2">
                    <TrendingDown className="mr-1 h-3 w-3" />
                    {deal.discountPercent}%
                  </span>
                </div>
                <CardDescription>{deal.site}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Original:</span>
                  <span className="line-through">${deal.originalPrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="text-muted-foreground">Sale Price:</span>
                  <span className="text-green-600 dark:text-green-400 text-lg">
                    ${deal.salePrice.toFixed(2)}
                  </span>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  className="w-full"
                  asChild
                >
                  <a
                    href={deal.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center"
                  >
                    View Deal
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

