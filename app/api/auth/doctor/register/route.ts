import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { saveDoctorDocument } from '@/lib/server/upload';

export const runtime = 'nodejs';

const ALLOWED_DOC_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

function readString(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function assertFile(value: FormDataEntryValue | null, fieldName: string) {
  if (!(value instanceof File) || value.size === 0) {
    throw new Error(`Missing ${fieldName}`);
  }

  if (!ALLOWED_DOC_TYPES.has(value.type)) {
    throw new Error(`${fieldName} has unsupported file type`);
  }

  return value;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const full_name = readString(formData.get('full_name'));
    const phone = readString(formData.get('phone'));
    const specialty = readString(formData.get('specialty'));
    const password = readString(formData.get('password'));
    const nationalIdFile = assertFile(formData.get('national_id_file'), 'national_id_file');
    const graduationCertificateFile = assertFile(formData.get('graduation_certificate_file'), 'graduation_certificate_file');

    if (!full_name || !phone || !password || !specialty) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const doctorsRef = adminDb.collection('doctors');
    const existing = await doctorsRef.where('phone', '==', phone).get();

    if (!existing.empty) {
      return NextResponse.json({ error: 'Phone already registered' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const docRef = doctorsRef.doc();
    const [nationalId, graduationCertificate] = await Promise.all([
      saveDoctorDocument(nationalIdFile, docRef.id, 'national_id'),
      saveDoctorDocument(graduationCertificateFile, docRef.id, 'graduation_certificate'),
    ]);

    await docRef.set({
      full_name,
      phone,
      specialty,
      password: hashedPassword,
      bio: '',
      location: { lat: 0, lng: 0 },
      status: 'verified',
      verificationStatus: 'verified',
      subscriptionStatus: 'inactive',
      subscriptionActive: false,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      nationalIdDocument: nationalId,
      graduationCertificateDocument: graduationCertificate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const token = signToken({ id: docRef.id, role: 'doctor' });
    const cookieStore = await cookies();
    cookieStore.set('token', token, { httpOnly: true, path: '/', maxAge: 7 * 24 * 60 * 60 });

    return NextResponse.json({
      success: true,
      redirectTo: '/doctor/processing',
      user: {
        id: docRef.id,
        full_name,
        phone,
        role: 'doctor',
        specialty,
        verificationStatus: 'verified',
      },
    });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message.startsWith('Missing') || message.includes('unsupported file type')) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
