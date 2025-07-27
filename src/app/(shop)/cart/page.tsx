'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

// Temporary cart data (will be replaced with actual state management)
const initialCartItems: CartItem[] = [
  {
    id: '1',
    name: 'Classic T-Shirt',
    price: 29.99,
    image: 'https://picsum.photos/400',
    quantity: 1
  },
  {
    id: '2',
    name: 'Denim Jeans',
    price: 59.99,
    image: 'https://picsum.photos/401',
    quantity: 2
  }
]

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems)

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1 // 10% tax
  const total = subtotal + tax

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Shopping Cart</h1>

      {cartItems.length > 0 ? (
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="space-y-4">
              {cartItems.map(item => (
                <Card key={item.id}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="h-24 w-24 overflow-hidden rounded-md">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Rp.{item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                        className="w-16 text-center"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        Rp.{(item.price * item.quantity).toFixed(2)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-medium">Order Summary</h3>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rp.{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (10%)</span>
                    <span>Rp.{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>Rp.{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <Button className="mt-6 w-full" size="lg">
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-muted-foreground">Your cart is empty</p>
          <Button className="mt-4" onClick={() => window.location.href = '/products'}>
            Continue Shopping
          </Button>
        </div>
      )}
    </div>
  )
}