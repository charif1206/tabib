import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

const DEFAULT_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
const BLOCKING_STATUSES = new Set(['pending', 'accepted', 'rescheduled']);

function normalizeSlots(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return DEFAULT_SLOTS;
  }

  const slots = value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  return slots.length ? slots : DEFAULT_SLOTS;
}

function getTodayIsoDate() {
  return new Date().toISOString().split('T')[0];
}

function isValidLocation(lat: unknown, lng: unknown) {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat === 0 && lng === 0) return false;
  return true;
}

function fakeLocationFromId(id: string) {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  }

  const baseLat = 33.5731;
  const baseLng = -7.5898;
  const latOffset = ((hash % 200) - 100) / 1000;
  const lngOffset = ((((hash >> 8) % 200) - 100) / 1000) * -1;

  return {
    lat: Number((baseLat + latOffset).toFixed(6)),
    lng: Number((baseLng + lngOffset).toFixed(6)),
  };
}

function normalizeLocation(data: Record<string, unknown>, doctorId: string) {
  const raw = data.location;
  if (raw && typeof raw === 'object') {
    const candidate = raw as { lat?: unknown; lng?: unknown };
    if (isValidLocation(candidate.lat, candidate.lng)) {
      return { lat: candidate.lat, lng: candidate.lng };
    }
  }

  const latitude = data.latitude;
  const longitude = data.longitude;
  if (isValidLocation(latitude, longitude)) {
    return { lat: latitude, lng: longitude };
  }

  const useFakeMapData = process.env.NODE_ENV !== 'production' || process.env.ENABLE_FAKE_MAP_DATA === 'true';
  if (useFakeMapData) {
    return fakeLocationFromId(doctorId);
  }

  return null;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get('q')?.trim().toLowerCase() ?? '';
    const today = getTodayIsoDate();

    const [doctorsSnapshot, appointmentsSnapshot] = await Promise.all([
      adminDb.collection('doctors').get(),
      adminDb.collection('appointments').where('appointmentDate', '==', today).get(),
    ]);

    const bookedSlotsByDoctor = new Map<string, Set<string>>();

    appointmentsSnapshot.forEach((doc) => {
      const appointment = doc.data();
      if (!BLOCKING_STATUSES.has(appointment.status)) {
        return;
      }

      const doctorId = appointment.doctorId as string | undefined;
      const slot = appointment.slot as string | undefined;

      if (!doctorId || !slot) {
        return;
      }

      if (!bookedSlotsByDoctor.has(doctorId)) {
        bookedSlotsByDoctor.set(doctorId, new Set());
      }
      bookedSlotsByDoctor.get(doctorId)!.add(slot);
    });

    const doctors = doctorsSnapshot.docs
      .map((doc) => {
        const data = doc.data() as Record<string, unknown>;
        const full_name = (data.full_name ?? '') as string;
        const specialty = (data.specialty ?? '') as string;
        const matches = !q || full_name.toLowerCase().includes(q) || specialty.toLowerCase().includes(q);

        if (!matches) {
          return null;
        }

        const configuredSlots = normalizeSlots(data.availableSlots);
        const booked = bookedSlotsByDoctor.get(doc.id) ?? new Set();
        const todayAvailableSlots = configuredSlots.filter((slot) => !booked.has(slot));

        return {
          id: doc.id,
          full_name,
          specialty,
          bio: (data.bio ?? '') as string,
          phone: (data.phone ?? '') as string,
          location: normalizeLocation(data, doc.id),
          todayAvailableSlots,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ doctors });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
