import { NextRequest, NextResponse } from 'next/server';
import { getProductById, updateProduct, deleteProduct, logAuditEvent } from '@/lib/db';
import { getSessionFromRequest, hasPermission } from '@/lib/security/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = getProductById(params.id);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: product });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Error fetching product' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'menu')) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Menu manager permission required' }, { status: 403 });
    }

    const body = await req.json();
    const updated = updateProduct(
      params.id,
      {
        category_id: body.category_id,
        name: body.name,
        slug: body.slug,
        description: body.description,
        price: body.price !== undefined ? Number(body.price) : undefined,
        image_url: body.image_url,
        prep_time: body.prep_time,
        is_available: body.is_available !== undefined ? Boolean(body.is_available) : undefined,
        is_featured: body.is_featured !== undefined ? Boolean(body.is_featured) : undefined,
        dietary_tags: Array.isArray(body.dietary_tags) ? body.dietary_tags : undefined,
      },
      Array.isArray(body.variations) ? body.variations : undefined,
      Array.isArray(body.extras) ? body.extras : undefined
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    logAuditEvent({
      userId: session.userId,
      userEmail: session.email,
      action: 'UPDATE_PRODUCT',
      entityType: 'product',
      entityId: params.id,
      details: { updated_fields: Object.keys(body) },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Error updating product' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'menu')) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Menu manager permission required' }, { status: 403 });
    }

    deleteProduct(params.id);

    logAuditEvent({
      userId: session.userId,
      userEmail: session.email,
      action: 'DELETE_PRODUCT',
      entityType: 'product',
      entityId: params.id,
    });

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
  }
}
