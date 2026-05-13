// src/app/api/products/route.ts - API товаров
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { transliterate } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const category = searchParams.get('category');
  const featured = searchParams.get('featured');

  const where: Record<string, unknown> = { inStock: true };
  if (category) where.categoryId = category;
  if (featured === 'true') where.isFeatured = true;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        productcategory: true,
        productsize: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: (page - 1) * limit + products.length < total,
  });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    let slug = data.slug || transliterate(data.name);

    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      slug = slug + '-' + Date.now().toString().slice(-6);
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        article: data.article || null,
        description: data.description || '',
        composition: data.composition || null,
        price: Number(data.price),
        oldPrice: data.oldPrice ? Number(data.oldPrice) : null,
        categoryId: data.categoryId,
        images: data.images ? JSON.stringify(data.images) : '[]',
        inStock: Boolean(data.inStock),
        isFeatured: Boolean(data.isFeatured),
        useSizes: Boolean(data.useSizes),
        quantity: data.useSizes ? 0 : data.quantity || 0,
        hasCustomization: Boolean(data.hasCustomization),
      },
    });

    // Создаём размеры если useSizes = true
    if (data.useSizes && data.sizes && Array.isArray(data.sizes) && data.sizes.length > 0) {
      for (const sizeItem of data.sizes) {
        await prisma.productSize.create({
          data: {
            productId: product.id,
            size: sizeItem.size,
            quantity: sizeItem.quantity,
          },
        });
      }
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
