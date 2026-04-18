import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';
import type { RatingPayload } from '@/lib/types/booking';

export async function PATCH(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session || session.role !== 'patient') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appointmentDoc = await adminDb.collection('appointments').doc(id).get();
    if (!appointmentDoc.exists) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const appointment = appointmentDoc.data() as Record<string, unknown>;
    if (appointment.patientId !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (appointment.status !== 'completed') {
      return NextResponse.json(
        { error: 'Can only rate completed appointments' },
        { status: 400 },
      );
    }

    let body: RatingPayload;
    try {
      body = (await _.json()) as RatingPayload;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const rating = body.rating;
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const comment = typeof body.comment === 'string' ? body.comment.slice(0, 500) : undefined;

    await adminDb.collection('appointments').doc(id).update({
      patientRating: body.rating,
      patientComment: comment || null,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


