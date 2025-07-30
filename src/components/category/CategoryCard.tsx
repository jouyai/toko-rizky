import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";

interface CategoryCardProps {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

export default function CategoryCard({ id, name, description, image }: CategoryCardProps) {
  return (
    <Link href={`/product?category=${encodeURIComponent(name)}`} className="group">
      <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm transition-all h-full hover:shadow-md hover:scale-[1.015]">
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
          <h3 className="text-base font-semibold leading-tight truncate">{name}</h3>
          <p className="text-sm text-muted-foreground truncate">{description || 'Lihat produk'}</p>
        </CardContent>
      </Card>
    </Link>
  );
}