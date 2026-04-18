import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';

export type DoctorVerificationStatus = 'pending_verification' | 'verified';
export type DoctorSubscriptionStatus = 'inactive' | 'active' | 'canceled';

export type DoctorAccessState = {
  id: string;
  verificationStatus: DoctorVerificationStatus;
  subscriptionStatus: DoctorSubscriptionStatus;
};

export function canAccessDoctorDashboard(state: DoctorAccessState) {
  return state.verificationStatus === 'verified' && state.subscriptionStatus === 'active';
}

export async function getDoctorAccessState(): Promise<DoctorAccessState | null> {
  const session = await getSession();
  if (!session || session.role !== 'doctor') {
    return null;
  }

  const doctorDoc = await adminDb.collection('doctors').doc(session.id).get();
  if (!doctorDoc.exists) {
    return null;
  }

  const data = doctorDoc.data() as Record<string, unknown>;

  const verificationStatus: DoctorVerificationStatus =
    data.verificationStatus === 'verified' ? 'verified' : 'pending_verification';

  let subscriptionStatus: DoctorSubscriptionStatus = 'inactive';
  if (data.subscriptionStatus === 'active' || data.subscriptionStatus === 'canceled') {
    subscriptionStatus = data.subscriptionStatus;
  }

  if (data.subscriptionActive === true) {
    subscriptionStatus = 'active';
  }

  return {
    id: session.id,
    verificationStatus,
    subscriptionStatus,
  };
}

export async function requireDoctorAccessForDashboard() {
  const state = await getDoctorAccessState();

  if (!state) {
    redirect('/doctor/login');
  }

  if (state.verificationStatus === 'pending_verification') {
    redirect('/doctor/processing');
  }

  if (!canAccessDoctorDashboard(state)) {
    redirect('/doctor/subscription');
  }

  return state;
}


