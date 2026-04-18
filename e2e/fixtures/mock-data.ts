export const mockDoctors = [
  {
    id: 'doc-1',
    full_name: 'د. سارة أحمد',
    specialty: 'Cardiology',
    rating: 4.8,
    ratingCount: 41,
    location: { lat: 33.5731, lng: -7.5898 },
    todayAvailableSlots: ['09:00', '10:00', '11:00'],
  },
  {
    id: 'doc-2',
    full_name: 'د. عمر علي',
    specialty: 'Dermatology',
    rating: 3.9,
    ratingCount: 15,
    location: { lat: 34.0209, lng: -6.8416 },
    todayAvailableSlots: ['14:00', '15:00'],
  },
];

export const mockDoctorProfile = {
  id: 'doc-1',
  full_name: 'د. سارة أحمد',
  specialty: 'Cardiology',
  rating: 4.8,
  ratingCount: 41,
  bio: 'استشارية أمراض القلب.',
  location: { lat: 33.5731, lng: -7.5898 },
  availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'],
  todayAvailableSlots: ['09:00', '10:00', '11:00'],
  weeklyAvailability: [
    { date: '2026-04-18', slots: ['09:00', '10:00', '11:00'] },
    { date: '2026-04-19', slots: ['14:00', '15:00'] },
    { date: '2026-04-20', slots: ['09:00'] },
  ],
};

export const mockDashboard = {
  totalRequests: 2,
  totalBookings: 1,
};

export const mockRequestsAppointments = [
  {
    id: 'apt-req-1',
    patientName: 'Ahmed N.',
    appointmentDate: '2026-04-18',
    slot: '09:00',
    status: 'pending',
    note: 'Chest pain follow-up',
  },
  {
    id: 'apt-req-2',
    patientName: 'Sara M.',
    appointmentDate: '2026-04-18',
    slot: '11:00',
    status: 'pending',
  },
];

export const mockBookingsAppointments = [
  {
    id: 'apt-book-1',
    patientName: 'Lina K.',
    appointmentDate: '2026-04-18',
    slot: '14:00',
    status: 'accepted',
  },
];

export const mockCalendar = {
  weekSchedule: {
    'Sat (2026-04-18)': {
      '09:00': 'booked',
      '10:00': 'free',
    },
    'Sun (2026-04-19)': {
      '09:00': 'free',
      '10:00': 'booked',
    },
  },
};


