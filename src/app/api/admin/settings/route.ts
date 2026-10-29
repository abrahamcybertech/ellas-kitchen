import { NextRequest, NextResponse } from 'next/server';
import { updateSettings, getSettings, logAuditEvent } from '@/lib/db';
import { getSessionFromRequest, hasPermission } from '@/lib/security/auth';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const settings = getSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'settings')) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Super admin permission required' }, { status: 403 });
    }

    const body = await req.json();
    const updated = updateSettings(body);

    logAuditEvent({
      userId: session.userId,
      userEmail: session.email,
      action: 'UPDATE_SETTINGS',
      entityType: 'settings',
      details: { updated_fields: Object.keys(body) },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to update settings' }, { status: 500 });
  }
}
