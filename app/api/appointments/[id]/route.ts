import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'patient') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { action } = await request.json();

    if (!action) {
      return NextResponse.json({ error: 'action is required' }, { status: 400 });
    }

    const appointmentRef = adminDb.collection('appointments').doc(id);
    const appointmentDoc = await appointmentRef.get();

    if (!appointmentDoc.exists) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const appointment = appointmentDoc.data()!;
    if (appointment.patientId !== session.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (action === 'cancel') {
      updateData.status = 'cancelled';
    } else if (action === 'accept_reschedule') {
      const newSlot = String(appointment.rescheduledSlot || '');
      if (!newSlot) {
        return NextResponse.json({ error: 'No rescheduled slot to accept' }, { status: 400 });
      }
      updateData.status = 'accepted';
      updateData.slot = newSlot;
      updateData.confirmed_time = newSlot;
      updateData.rescheduledSlot = null;
      updateData.new_time = null;
    } else if (action === 'reject_reschedule') {
      updateData.status = 'pending';
      updateData.rescheduledSlot = null;
      updateData.new_time = null;
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

