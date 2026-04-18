export const APPOINTMENT_STATUSES = [
  'pending',
  'accepted',
  'rejected',
  'rescheduled',
  'completed',
  'no_show',
  'cancelled',
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export type DoctorListItem = {
  id: string;
  full_name: string;
  specialty: string;
  rating?: number | null;
  ratingCount?: number;
  bio?: string;
  phone?: string;
  location?: {
    lat: number;
    lng: number;
  } | null;
  distanceKm?: number | null;
  todayAvailableSlots: string[];
};

export type WeeklyAvailabilityDay = {
  date: string;
  slots: string[];
};

export type DoctorProfile = DoctorListItem & {
  availableSlots: string[];
  weeklyAvailability: WeeklyAvailabilityDay[];
};

export type Appointment = {
  id: string;
  doctorId: string;
  patientId: string;
  doctorName?: string;
  patientName?: string;
  specialty?: string;
  appointmentDate: string;
  slot: string;
  requested_time?: string;
  confirmed_time?: string;
  new_time?: string | null;
  rescheduledSlot?: string | null;
  status: AppointmentStatus;
  note?: string;
  patientRating?: number | null;
  patientComment?: string;
  createdAt: string;
  updatedAt?: string;
};

export type RatingPayload = {
  rating: number;
  comment?: string;
};

export const SYMPTOMS = [
  'الحمى',
  'الم الاسنان',
  'الم المعدة',
  'السعال',
  'الإسهال',
  'الصداع',
  'الإرهاق',
  'صعوبة التنفس',
] as const;

export type Symptom = (typeof SYMPTOMS)[number];

export type MeResponse = {
  authenticated: true;
  user: {
    id: string;
    role: 'patient' | 'doctor';
    full_name?: string;
    phone?: string;
    specialty?: string;
  };
  appointments: Appointment[];
};
