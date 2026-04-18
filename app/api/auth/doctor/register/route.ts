import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { full_name, phone, specialty, password } = await request.json();

    if (!full_name || !phone || !password || !specialty) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const doctorsRef = adminDb.collection('doctors');
    const existing = await doctorsRef.where('phone', '==', phone).get();

    if (!existing.empty) {
      return NextResponse.json({ error: 'Phone already registered' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const docRef = await doctorsRef.add({
      full_name,
      phone,
      specialty,
      password: hashedPassword,
      bio: '',
      location: { lat: 0, lng: 0 },
      createdAt: new Date().toISOString()
    });

    const token = signToken({ id: docRef.id, role: 'doctor' });
    const cookieStore = await cookies();
    cookieStore.set('token', token, { httpOnly: true, path: '/', maxAge: 7 * 24 * 60 * 60 });

    return NextResponse.json({ success: true, user: { id: docRef.id, full_name, phone, role: 'doctor', specialty } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
