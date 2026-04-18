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
  bio?: string;
  phone?: string;
  location?: {
    lat: number;
    lng: number;
  } | null;
  todayAvailableSlots: string[];
};

export type DoctorProfile = DoctorListItem & {
  availableSlots: string[];
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
  createdAt: string;
  updatedAt?: string;
};

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

