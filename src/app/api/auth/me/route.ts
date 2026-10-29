import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/security/auth';
import { getStaffById } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const staff = getStaffById(session.userId);
    if (!staff || !staff.is_active) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, user: null }, { status: 500 });
  }
}
