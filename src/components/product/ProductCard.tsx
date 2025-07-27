import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ProductCardProps {
  id: string
  name: string
  price: number
  image: string
  category: string
}

export default function ProductCard({ id, name, price, image, category }: ProductCardProps) {
  return (
    <Card className="group rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:scale-[1.015]">
      <CardHeader className="p-0">
        <div className="aspect-square overflow-hidden rounded-t-2xl">
          <img
            src={image || "/placeholder.jpg"}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <Badge variant="outline" className="text-xs px-2 py-0.5 rounded-full">
          {category || "Uncategorized"}
        </Badge>
        <h3 className="text-base font-semibold leading-tight truncate">{name}</h3>
        <p className="text-sm text-muted-foreground">Rp {price.toLocaleString()}</p>
      </CardContent>
    </Card>
  )
}
