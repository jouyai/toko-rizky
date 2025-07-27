'use client'

import { useState } from 'react'
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const categories = [
  {
    id: '1',
    name: 'Clothing',
    description: 'T-shirts, hoodies, and more',
    itemCount: 42,
    image: 'https://picsum.photos/400'
  },
  {
    id: '2',
    name: 'Accessories',
    description: 'Watches, jewelry, and bags',
    itemCount: 24,
    image: 'https://picsum.photos/401'
  },
  {
    id: '3',
    name: 'Footwear',
    description: 'Shoes, sandals, and boots',
    itemCount: 18,
    image: 'https://picsum.photos/402'
  }
]

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        
        <Input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-[200px]"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.map(category => (
          <Card key={category.id} className="group overflow-hidden transition-all hover:shadow-lg">
            <CardHeader className="p-0">
              <div className="aspect-video overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover object-center transition-transform group-hover:scale-105"
                />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <h3 className="text-lg font-medium">{category.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
              <p className="text-sm text-muted-foreground">{category.itemCount} items</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center text-muted-foreground">
          No categories found. Try adjusting your search.
        </div>
      )}
    </div>
  )
}