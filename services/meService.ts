import { MeResponse } from '@/lib/types/booking';

export async function getMe(): Promise<MeResponse> {
  const response = await fetch('/api/me', { cache: 'no-store' });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'غير مصرح');
  }

  return (await response.json()) as MeResponse;
}

