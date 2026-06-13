// src/app/api/products/route.ts - API товаров
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { transliterate } from '@/lib/utils';
import { auditCreateData } from '@/lib/admin-audit-route';
import { getSiteLangFromRequest } from '@/lib/content-translations-server';
import { localizeProducts, saveBeContentTranslations } from '@/lib/content-translations';
import { nextProductSortOrder, productCatalogOrderBy } from '@/lib/product-catalog-order';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const category = searchParams.get('category');
  const featured = searchParams.get('featured');
  const forAdmin = searchParams.get('admin') === '1';
  const lang = forAdmin ? 'ru' : getSiteLangFromRequest(request);

  const where: Record<string, unknown> = { inStock: true };
  if (category) where.categoryId = category;
  if (featured === 'true') where.isFeatured = true;

  const [productsRaw, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        productcategory: true,
        manufacturer: true,
        productsize: { orderBy: [{ sortOrder: 'asc' }, { size: 'asc' }] },
      },
      orderBy: productCatalogOrderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const products = await localizeProducts(productsRaw, lang);

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

    const isHit = Boolean(data.isHit);
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
        manufacturerId:
          data.manufacturerId && String(data.manufacturerId).trim()
            ? String(data.manufacturerId).trim()
            : null,
        images: data.images ? JSON.stringify(data.images) : '[]',
        inStock: Boolean(data.inStock),
        isFeatured: Boolean(data.isFeatured),
        isHit,
        sortOrder: await nextProductSortOrder(isHit),
        useSizes: Boolean(data.useSizes),
        quantity: data.useSizes ? 0 : data.quantity || 0,
        hasCustomization: Boolean(data.hasCustomization),
        ...(await auditCreateData()),
      },
    });

    // Создаём размеры если useSizes = true
    if (data.useSizes && data.sizes && Array.isArray(data.sizes) && data.sizes.length > 0) {
      for (let i = 0; i < data.sizes.length; i++) {
        const sizeItem = data.sizes[i] as { size: string; quantity: number };
        await prisma.productSize.create({
          data: {
            productId: product.id,
            size: sizeItem.size,
            quantity: sizeItem.quantity,
            sortOrder: i,
          },
        });
      }
    }

    if (data.be && typeof data.be === 'object') {
      await saveBeContentTranslations('product', product.id, data.be);
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
