import { NextRequest, NextResponse } from 'next/server';
import { getAllStaff, createStaffMember, logAuditEvent } from '@/lib/db';
import { getSessionFromRequest, hasPermission } from '@/lib/security/auth';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'staff')) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Super admin permission required' }, { status: 403 });
    }

    const staffList = getAllStaff();
    return NextResponse.json({ success: true, data: staffList });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Failed to fetch staff list' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'staff')) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Super admin permission required' }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ success: false, error: 'Name, email, password, and role are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    const validRoles = ['super_admin', 'order_manager', 'menu_manager'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ success: false, error: 'Invalid role specified' }, { status: 400 });
    }

    const newStaff = createStaffMember({ name, email, password, role });

    logAuditEvent({
      userId: session.userId,
      userEmail: session.email,
      action: 'CREATE_STAFF',
      entityType: 'staff',
      entityId: newStaff.id,
      details: { email: newStaff.email, role: newStaff.role },
    });

    return NextResponse.json({ success: true, data: newStaff }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to create staff user' }, { status: 500 });
  }
}
