// src/app/shop/product/[slug]/page.tsx - Карточка товара
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getMainSquadPlayersForCustomization } from '@/lib/shop-customization-players';
import { notFound } from 'next/navigation';
import { getSiteLangFromCookies } from '@/lib/content-translations-server';
import { loadBeTranslationsMap, localizeProductRecord } from '@/lib/content-translations';
import { resolveContextualSiteMetadata } from '@/lib/site-page-meta';
import ProductPageClient from './ProductPageClient';

interface Props {
  params: Promise<{ slug: string }>;
}

function defaultProductTitle(name: string, price: number): string {
  return `${name} ФК «Динамо-Брест» купить за ${price.toFixed(2)} BYN`;
}

function productDescriptionExcerpt(description: string | null | undefined): string | undefined {
  if (!description?.trim()) return undefined;
  return description
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lang = await getSiteLangFromCookies();
  const productRaw = await prisma.product.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      price: true,
      description: true,
      productcategory: { select: { name: true } },
    },
  });

  if (!productRaw) {
    return { title: 'Товар | ФК «Динамо-Брест»' };
  }

  let product = productRaw;
  if (lang === 'be') {
    const tr = await loadBeTranslationsMap('product', [productRaw.id]);
    product = localizeProductRecord(productRaw, lang, tr);
  }

  const price = Number(product.price);
  const path = `/shop/product/${slug}`;

  return resolveContextualSiteMetadata(
    path,
    {
      name: product.name,
      price: price.toFixed(2),
      category: product.productcategory?.name ?? '',
    },
    {
      title: defaultProductTitle(product.name, price),
      description: productDescriptionExcerpt(product.description),
    }
  );
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const lang = await getSiteLangFromCookies();
  const productRaw = await prisma.product.findUnique({
    where: { slug },
    include: {
      productcategory: true,
      manufacturer: true,
      productsize: { orderBy: [{ sortOrder: 'asc' }, { size: 'asc' }] },
    },
  });

  if (!productRaw) notFound();

  let product = productRaw;
  if (lang === 'be') {
    const tr = await loadBeTranslationsMap('product', [productRaw.id]);
    product = localizeProductRecord(productRaw, lang, tr);
  }

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
    const [custRows, squadPlayers] = await Promise.all([
      prisma.customization.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      }),
      getMainSquadPlayersForCustomization(),
    ]);
    customizations = custRows.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      price: c.price.toString(),
      imageUrl: c.imageUrl,
    }));
    players = squadPlayers;
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
