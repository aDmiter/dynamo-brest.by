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
      manufacturer: true,
      productsize: { orderBy: [{ sortOrder: 'asc' }, { size: 'asc' }] },
    },
  });

  if (!product) notFound();

  const hasCustomization = product.hasCustomization === true;

  let customizations: {
    id: string;
    name: string;
    type: string;
    price: string;
    imageUrl?: string | null;
  }[] = [];
  let players: { id: string; name: string; number: number }[] = [];

  if (hasCustomization) {
    const [custRows, playerRows] = await Promise.all([
      prisma.customization.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      }),
      prisma.playerCustomization.findMany({
        where: { isActive: true },
        orderBy: { number: 'asc' },
      }),
    ]);
    customizations = custRows.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      price: c.price.toString(),
      imageUrl: c.imageUrl,
    }));
    players = playerRows.map((p) => ({
      id: p.id,
      name: p.name,
      number: p.number,
    }));
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
        useSizes: product.useSizes,
        hasCustomization,
        productcategory: product.productcategory ? { name: product.productcategory.name } : null,
        manufacturer: product.manufacturer ? { name: product.manufacturer.name } : null,
        productsize: product.productsize,
      }}
      customizations={customizations}
      players={players}
    />
  );
}
