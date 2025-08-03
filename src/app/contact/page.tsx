'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement contact form submission logic
    setSubmitted(true)
  }

  useEffect(() => {
    document.title = 'Contact | Toko Rizky';
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-4xl font-extrabold mb-6">Contact Us</CardTitle>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <p className="text-green-600 text-lg">Thank you for your message! We will get back to you soon.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  className="w-full rounded-md border border-gray-300 p-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={5}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Send Message
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}