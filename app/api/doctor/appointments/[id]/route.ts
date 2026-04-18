import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';

const BLOCKING_STATUSES = new Set(['pending', 'accepted', 'rescheduled']);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'doctor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { action, new_time, newSlot } = await request.json();

    if (!action) {
      return NextResponse.json({ error: 'action is required' }, { status: 400 });
    }

    const appointmentRef = adminDb.collection('appointments').doc(id);
    const appointmentDoc = await appointmentRef.get();

    if (!appointmentDoc.exists) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const appointment = appointmentDoc.data()!;
    if (appointment.doctorId !== session.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (action === 'accept') {
      updateData.status = 'accepted';
      updateData.confirmed_time = appointment.requested_time || appointment.slot;
    } else if (action === 'reject') {
      updateData.status = 'rejected';
    } else if (action === 'reschedule') {
      const targetSlot = String(new_time || newSlot || '');
      if (!targetSlot) {
        return NextResponse.json({ error: 'new_time is required for reschedule' }, { status: 400 });
      }

      const sameSlotSnapshot = await adminDb
        .collection('appointments')
        .where('doctorId', '==', session.id)
        .where('appointmentDate', '==', appointment.appointmentDate)
        .where('slot', '==', targetSlot)
        .get();

      const hasConflict = sameSlotSnapshot.docs.some(
        (doc) => doc.id !== id && BLOCKING_STATUSES.has(String(doc.data().status)),
      );

      if (hasConflict) {
        return NextResponse.json({ error: 'Selected reschedule slot is unavailable' }, { status: 409 });
      }

      updateData.status = 'rescheduled';
      updateData.rescheduledSlot = targetSlot;
      updateData.new_time = targetSlot;
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await appointmentRef.update(updateData);

    return NextResponse.json({
      success: true,
      appointment: { id, ...updateData },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


