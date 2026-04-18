import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

function isAdminAuthorized(request: Request) {
  const adminSecret = process.env.ADMIN_VERIFICATION_SECRET;
  if (!adminSecret) {
    return false;
  }

  const headerValue = request.headers.get('x-admin-secret');
  return headerValue === adminSecret;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!isAdminAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized admin action' }, { status: 401 });
    }

    const { id } = await params;
    const doctorRef = adminDb.collection('doctors').doc(id);
    const doctorDoc = await doctorRef.get();

    if (!doctorDoc.exists) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    await doctorRef.set(
      {
        status: 'verified',
        verificationStatus: 'verified',
        subscriptionStatus: 'inactive',
        subscriptionActive: false,
        verifiedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    return NextResponse.json({ success: true, id, verificationStatus: 'verified' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

