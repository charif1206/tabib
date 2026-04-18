import { NextResponse } from 'next/server';
import { getDoctorAccessState } from '@/lib/server/doctor-access';
import { getStripeServer } from '@/lib/server/stripe';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: Request) {
  try {
    const state = await getDoctorAccessState();
    if (!state) {
      return NextResponse.redirect(new URL('/doctor/login', request.url));
    }

    const sessionId = new URL(request.url).searchParams.get('session_id');
    if (!sessionId) {
      return NextResponse.redirect(new URL('/doctor/subscription?canceled=1', request.url));
    }

    const stripe = getStripeServer();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    const sessionDoctorId = session.metadata?.doctorId;
    if (sessionDoctorId !== state.id || session.payment_status !== 'paid') {
      return NextResponse.redirect(new URL('/doctor/subscription?canceled=1', request.url));
    }

    const subscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription && 'id' in session.subscription
          ? session.subscription.id
          : null;

    await adminDb.collection('doctors').doc(state.id).set(
      {
        status: 'verified',
        verificationStatus: 'verified',
        subscriptionStatus: 'active',
        subscriptionActive: true,
        stripeCustomerId: typeof session.customer === 'string' ? session.customer : null,
        stripeSubscriptionId: subscriptionId,
        subscriptionUpdatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(new URL('/doctor/subscription?canceled=1', request.url));
  }
}


