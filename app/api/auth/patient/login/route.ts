import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const usersRef = adminDb.collection('users');
    const snapshot = await usersRef.where('phone', '==', phone).get();

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Invalid phone or password' }, { status: 400 });
    }

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid phone or password' }, { status: 400 });
    }

    const token = signToken({ id: userDoc.id, role: 'patient' });
    const cookieStore = await cookies();
    cookieStore.set('token', token, { httpOnly: true, path: '/', maxAge: 7 * 24 * 60 * 60 });

    return NextResponse.json({ success: true, user: { id: userDoc.id, full_name: user.full_name, phone, role: 'patient' } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
