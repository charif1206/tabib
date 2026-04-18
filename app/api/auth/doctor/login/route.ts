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

    const doctorsRef = adminDb.collection('doctors');
    const snapshot = await doctorsRef.where('phone', '==', phone).get();

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Invalid phone or password' }, { status: 400 });
    }

    const doc = snapshot.docs[0];
    const doctor = doc.data();

    const isValid = await bcrypt.compare(password, doctor.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid phone or password' }, { status: 400 });
    }

    const token = signToken({ id: doc.id, role: 'doctor' });
    const cookieStore = await cookies();
    cookieStore.set('token', token, { httpOnly: true, path: '/', maxAge: 7 * 24 * 60 * 60 });

    return NextResponse.json({ success: true, user: { id: doc.id, full_name: doctor.full_name, phone, role: 'doctor' } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
