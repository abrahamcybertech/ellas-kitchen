import { NextRequest, NextResponse } from 'next/server';
import { getCategories, createCategory, logAuditEvent } from '@/lib/db';
import { getSessionFromRequest, hasPermission } from '@/lib/security/auth';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const showAll = url.searchParams.get('all') === 'true';

    let publishedOnly = true;
    if (showAll) {
      const session = getSessionFromRequest(req);
      if (session) {
        publishedOnly = false;
      }
    }

    const categories = getCategories(publishedOnly);
    return NextResponse.json({ success: true, data: categories });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 });
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
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 });
    }

    const category = createCategory({
      name: body.name,
      slug: body.slug,
      description: body.description,
      image_url: body.image_url,
      display_order: Number(body.display_order || 0),
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
    });

    logAuditEvent({
      userId: session.userId,
      userEmail: session.email,
      action: 'CREATE_CATEGORY',
      entityType: 'category',
      entityId: category.id,
      details: { name: category.name, slug: category.slug },
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to create category' }, { status: 500 });
  }
}
