'use client'

import { useState } from 'react'
import ProductCard from '@/components/product/ProductCard'
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const products = [
  {
    id: '1',
    name: 'Classic T-Shirt',
    price: 29.99,
    image: 'https://picsum.photos/400',
    category: 'Clothing'
  },
  // ... other products
]

const categories = ['All', 'Clothing', 'Accessories', 'Footwear']
const sortOptions = ['Price: Low to High', 'Price: High to Low', 'Name: A to Z', 'Name: Z to A']

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState(sortOptions[0])
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProducts = products
    .filter(product => 
      (selectedCategory === 'All' || product.category === selectedCategory) &&
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'Price: Low to High':
          return a.price - b.price
        case 'Price: High to Low':
          return b.price - a.price
        case 'Name: A to Z':
          return a.name.localeCompare(b.name)
        case 'Name: Z to A':
          return b.name.localeCompare(a.name)
        default:
          return 0
      }
    })

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        
        <div className="flex flex-wrap gap-4">
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[200px]"
          />
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center text-muted-foreground">
          No products found. Try adjusting your filters.
        </div>
      )}
    </div>
  )
}