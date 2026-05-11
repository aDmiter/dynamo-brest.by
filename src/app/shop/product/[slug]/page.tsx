// src/app/shop/product/[slug]/page.tsx - Карточка товара
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ProductPageClient from './ProductPageClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      productcategory: true,
      productsize: { orderBy: { size: 'asc' } },
    },
  });

  if (!product) notFound();

  const hasCustomization = Boolean((product as Record<string, unknown>).hasCustomization);

  let customizations: {
    id: string;
    name: string;
    type: string;
    price: string;
    imageUrl?: string | null;
  }[] = [];
  let players: { id: string; name: string; number: number }[] = [];

  if (hasCustomization) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const [custRes, playersRes] = await Promise.all([
        fetch(`${baseUrl}/api/customizations`, { next: { revalidate: 60 } }),
        fetch(`${baseUrl}/api/players-customization`, { next: { revalidate: 60 } }),
      ]);
      const custData = await custRes.json();
      const playersData = await playersRes.json();
      customizations = Array.isArray(custData) ? custData : [];
      players = Array.isArray(playersData) ? playersData : [];
    } catch {
      /* silently fail */
    }
  }

  return (
    <ProductPageClient
      product={{
        id: product.id,
        name: product.name,
        description: product.description,
        composition: product.composition,
        price: product.price,
        oldPrice: product.oldPrice,
        article: product.article,
        inStock: product.inStock,
        images: product.images,
        quantity: product.quantity,
        hasCustomization,
        productcategory: product.productcategory ? { name: product.productcategory.name } : null,
        productsize: product.productsize,
      }}
      customizations={customizations}
      players={players}
    />
  );
}
