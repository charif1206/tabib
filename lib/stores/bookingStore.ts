import { create } from 'zustand';

type BookingUiState = {
  doctorSearch: string;
  selectedSlotByDoctor: Record<string, string>;
  selectedDateByDoctor: Record<string, string>;
  bookingMessage: string;
  setDoctorSearch: (value: string) => void;
  setSelectedSlot: (doctorId: string, slot: string) => void;
  setSelectedDate: (doctorId: string, date: string) => void;
  setBookingMessage: (value: string) => void;
  clearBookingMessage: () => void;
};

export const useBookingStore = create<BookingUiState>((set) => ({
  doctorSearch: '',
  selectedSlotByDoctor: {},
  selectedDateByDoctor: {},
  bookingMessage: '',
  setDoctorSearch: (value) => set({ doctorSearch: value }),
  setSelectedSlot: (doctorId, slot) =>
    set((state) => ({
      selectedSlotByDoctor: {
        ...state.selectedSlotByDoctor,
        [doctorId]: slot,
      },
    })),
  setSelectedDate: (doctorId, date) =>
    set((state) => ({
      selectedDateByDoctor: {
        ...state.selectedDateByDoctor,
        [doctorId]: date,
      },
    })),
  setBookingMessage: (value) => set({ bookingMessage: value }),
  clearBookingMessage: () => set({ bookingMessage: '' }),
}));

