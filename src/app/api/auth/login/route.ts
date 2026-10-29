import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getStaffByEmail, updateStaffLoginTimestamp, logAuditEvent } from '@/lib/db';
import { signStaffToken } from '@/lib/security/auth';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    // Rate limit: 5 login attempts per 15 minutes per IP
    const rateCheck = checkRateLimit(`login_${ip}`, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many failed login attempts. Please wait 15 minutes before trying again.',
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    const staff = getStaffByEmail(email);
    if (!staff) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    const match = bcrypt.compareSync(password, staff.password_hash);
    if (!match) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    updateStaffLoginTimestamp(staff.id);

    const token = signStaffToken(staff);

    logAuditEvent({
      userId: staff.id,
      userEmail: staff.email,
      action: 'LOGIN',
      entityType: 'staff',
      entityId: staff.id,
      ipAddress: ip,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        token,
      },
    });

    // Set HTTP-only secure cookie
    response.cookies.set('ella_staff_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 12 * 60 * 60, // 12 hours
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 500 });
  }
}
