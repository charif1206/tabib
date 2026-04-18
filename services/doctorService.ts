import { DoctorListItem, DoctorProfile } from '@/lib/types/booking';

export async function getDoctors(search?: string): Promise<DoctorListItem[]> {
  const params = new URLSearchParams();
  if (search?.trim()) {
    params.set('q', search.trim());
  }

  const response = await fetch(`/api/doctors${params.toString() ? `?${params.toString()}` : ''}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('تعذر تحميل قائمة الأطباء');
  }

  const data = (await response.json()) as { doctors: DoctorListItem[] };
  return data.doctors;
}

export async function getDoctorById(id: string): Promise<DoctorProfile> {
  const response = await fetch(`/api/doctors/${id}`, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('تعذر تحميل بيانات الطبيب');
  }

  const data = (await response.json()) as { doctor: DoctorProfile };
  return data.doctor;
}
