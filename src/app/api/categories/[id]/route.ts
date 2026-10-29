import { NextRequest, NextResponse } from 'next/server';
import { getCategoryById, updateCategory, deleteCategory, logAuditEvent } from '@/lib/db';
import { getSessionFromRequest, hasPermission } from '@/lib/security/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const category = getCategoryById(params.id);
    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: category });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Error fetching category' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'menu')) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Menu manager permission required' }, { status: 403 });
    }

    const body = await req.json();
    const updated = updateCategory(params.id, {
      name: body.name,
      slug: body.slug,
      description: body.description,
      image_url: body.image_url,
      display_order: body.display_order !== undefined ? Number(body.display_order) : undefined,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : undefined,
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    logAuditEvent({
      userId: session.userId,
      userEmail: session.email,
      action: 'UPDATE_CATEGORY',
      entityType: 'category',
      entityId: params.id,
      details: { updated_fields: Object.keys(body) },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Error updating category' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'menu')) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Menu manager permission required' }, { status: 403 });
    }

    const result = deleteCategory(params.id);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    logAuditEvent({
      userId: session.userId,
      userEmail: session.email,
      action: 'DELETE_CATEGORY',
      entityType: 'category',
      entityId: params.id,
    });

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Failed to delete category' }, { status: 500 });
  }
}
