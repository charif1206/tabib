import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';

const DEFAULT_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

function getWeekDates() {
  const today = new Date();
  const days: Record<string, string> = {};
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const isoDate = date.toISOString().split('T')[0];
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    days[`${dayName} (${isoDate})`] = isoDate;
  }
  return days;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'doctor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const doctorDoc = await adminDb.collection('doctors').doc(session.id).get();
    if (!doctorDoc.exists) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    const doctorData = doctorDoc.data()!;
    const availableSlots = Array.isArray(doctorData.availableSlots)
      ? doctorData.availableSlots
      : DEFAULT_SLOTS;

    const weekDates = getWeekDates();
    const appointmentsSnapshot = await adminDb
      .collection('appointments')
      .where('doctorId', '==', session.id)
      .get();

    const bookedSlotsMap = new Map<string, Set<string>>();

    appointmentsSnapshot.forEach((doc) => {
      const appointment = doc.data();
      const date = appointment.appointmentDate as string;
      const slot = appointment.slot as string;
      const status = appointment.status as string;

      if (!['accepted', 'pending', 'rescheduled'].includes(status)) {
        return;
      }

      if (!bookedSlotsMap.has(date)) {
        bookedSlotsMap.set(date, new Set());
      }
      bookedSlotsMap.get(date)!.add(slot);
    });

    const weekSchedule: Record<string, Record<string, string>> = {};

    Object.entries(weekDates).forEach(([dayLabel, isoDate]) => {
      weekSchedule[dayLabel] = {};
      const bookedSlots = bookedSlotsMap.get(isoDate) || new Set();

      availableSlots.forEach((slot) => {
        weekSchedule[dayLabel][slot] = bookedSlots.has(slot) ? 'booked' : 'free';
      });
    });

    return NextResponse.json({ weekSchedule });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


