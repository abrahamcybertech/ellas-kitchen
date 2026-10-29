import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { Role, StaffUser } from '@/lib/types';
import { getStaffById } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'ellas-kitchen-production-jwt-secret-key-2026-secure-auth';
const COOKIE_NAME = 'ella_staff_token';

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  role: Role;
}

export function signStaffToken(user: StaffUser): string {
  const payload: AuthSession = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
}

export function verifyStaffToken(token: string): AuthSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthSession;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(req: NextRequest | Request): AuthSession | null {
  // Check Authorization Header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    return verifyStaffToken(token);
  }

  // Check Cookie
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  if (match) {
    const token = decodeURIComponent(match[1]);
    return verifyStaffToken(token);
  }

  return null;
}

export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const session = verifyStaffToken(token);
  if (!session) return null;

  // Also confirm user is still active in database
  const staff = getStaffById(session.userId);
  if (!staff || !staff.is_active) return null;

  return session;
}

export function hasPermission(role: Role, requiredResource: 'orders' | 'menu' | 'settings' | 'staff' | 'audit'): boolean {
  if (role === 'super_admin') return true;

  if (role === 'order_manager') {
    return requiredResource === 'orders';
  }

  if (role === 'menu_manager') {
    return requiredResource === 'menu';
  }

  return false;
}
