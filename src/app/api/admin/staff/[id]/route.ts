import { NextRequest, NextResponse } from 'next/server';
import { updateStaffMember, logAuditEvent } from '@/lib/db';
import { getSessionFromRequest, hasPermission } from '@/lib/security/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'staff')) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Super admin permission required' }, { status: 403 });
    }

    const body = await req.json();
    const updated = updateStaffMember(params.id, body);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Staff member not found' }, { status: 404 });
    }

    logAuditEvent({
      userId: session.userId,
      userEmail: session.email,
      action: 'UPDATE_STAFF',
      entityType: 'staff',
      entityId: params.id,
      details: { role: updated.role, is_active: updated.is_active },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to update staff member' }, { status: 500 });
  }
}
