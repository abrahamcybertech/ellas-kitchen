import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getStaffByEmail, updateStaffMember, logAuditEvent } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/security/auth';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`change_password_${session.userId}_${ip}`, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many password change attempts. Please wait 15 minutes before trying again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { current_password, new_password } = body;

    if (!current_password || !new_password) {
      return NextResponse.json(
        { success: false, error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (new_password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (current_password === new_password) {
      return NextResponse.json(
        { success: false, error: 'New password must be different from your current password' },
        { status: 400 }
      );
    }

    const staff = getStaffByEmail(session.email);
    if (!staff) {
      return NextResponse.json({ success: false, error: 'Staff account not found' }, { status: 404 });
    }

    if (!bcrypt.compareSync(current_password, staff.password_hash)) {
      return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 401 });
    }

    const updated = updateStaffMember(session.userId, { password: new_password });
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Failed to update password' }, { status: 500 });
    }

    logAuditEvent({
      userId: session.userId,
      userEmail: session.email,
      action: 'CHANGE_PASSWORD',
      entityType: 'staff',
      entityId: session.userId,
      ipAddress: ip,
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Password update failed' }, { status: 500 });
  }
}
