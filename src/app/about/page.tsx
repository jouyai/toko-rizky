import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-4xl font-extrabold">About Toko Rizky</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-lg text-gray-700">
          <p>
            Welcome to Toko Rizky, your number one source for all things amazing. We're dedicated to giving you the very best products, with a focus on quality, customer service, and uniqueness.
          </p>
          <p>
            Founded in 2024, Toko Rizky has come a long way from its beginnings. When we first started out, our passion for providing the best products drove us to do intense research and gave us the impetus to turn hard work and inspiration into a booming online store.
          </p>
          <p>
            We hope you enjoy our products as much as we enjoy offering them to you. If you have any questions or comments, please don't hesitate to contact us.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}