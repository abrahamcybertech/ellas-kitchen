import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct, logAuditEvent } from '@/lib/db';
import { getSessionFromRequest, hasPermission } from '@/lib/security/auth';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const categoryId = url.searchParams.get('categoryId') || undefined;
    const categorySlug = url.searchParams.get('category') || undefined;
    const featuredOnly = url.searchParams.get('featured') === 'true';
    const search = url.searchParams.get('search') || undefined;
    const showAll = url.searchParams.get('all') === 'true';

    let publishedOnly = true;
    if (showAll) {
      const session = getSessionFromRequest(req);
      if (session) {
        publishedOnly = false;
      }
    }

    const products = getProducts({
      categoryId,
      categorySlug,
      featuredOnly,
      search,
      publishedOnly,
    });

    return NextResponse.json({ success: true, data: products });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'menu')) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Menu manager permission required' }, { status: 403 });
    }

    const body = await req.json();

    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Product name is required' }, { status: 400 });
    }

    if (!body.category_id || typeof body.category_id !== 'string') {
      return NextResponse.json({ success: false, error: 'Category selection is required' }, { status: 400 });
    }

    if (body.price === undefined || isNaN(Number(body.price)) || Number(body.price) < 0) {
      return NextResponse.json({ success: false, error: 'Valid price in Naira is required' }, { status: 400 });
    }

    const product = createProduct(
      {
        category_id: body.category_id,
        name: body.name,
        slug: body.slug,
        description: body.description,
        price: Number(body.price),
        image_url: body.image_url,
        prep_time: body.prep_time,
        is_available: body.is_available !== undefined ? Boolean(body.is_available) : true,
        is_featured: body.is_featured !== undefined ? Boolean(body.is_featured) : false,
        dietary_tags: Array.isArray(body.dietary_tags) ? body.dietary_tags : [],
      },
      Array.isArray(body.variations) ? body.variations : [],
      Array.isArray(body.extras) ? body.extras : []
    );

    logAuditEvent({
      userId: session.userId,
      userEmail: session.email,
      action: 'CREATE_PRODUCT',
      entityType: 'product',
      entityId: product.id,
      details: { name: product.name, price: product.price, category_id: product.category_id },
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to create product' }, { status: 500 });
  }
}
