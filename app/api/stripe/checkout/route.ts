import { NextResponse } from 'next/server';
import { getDoctorAccessState } from '@/lib/server/doctor-access';
import { adminDb } from '@/lib/firebase-admin';
import { getStripeServer } from '@/lib/server/stripe';

const MONTHLY_PRICE_USD_CENTS = 2000;

export async function POST(request: Request) {
  try {
    const state = await getDoctorAccessState();
    if (!state) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (state.verificationStatus !== 'verified') {
      return NextResponse.json({ error: 'Doctor is not verified yet' }, { status: 403 });
    }

    if (state.subscriptionStatus === 'active') {
      return NextResponse.json({ url: '/dashboard' });
    }

    const stripe = getStripeServer();
    const doctorDoc = await adminDb.collection('doctors').doc(state.id).get();
    if (!doctorDoc.exists) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    const doctor = doctorDoc.data() as Record<string, unknown>;
    const origin = new URL(request.url).origin;

    let customerId = typeof doctor.stripeCustomerId === 'string' ? doctor.stripeCustomerId : '';
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: typeof doctor.full_name === 'string' ? doctor.full_name : state.id,
        phone: typeof doctor.phone === 'string' ? doctor.phone : undefined,
        metadata: {
          doctorId: state.id,
        },
      });
      customerId = customer.id;
      await doctorDoc.ref.update({
        stripeCustomerId: customer.id,
        updatedAt: new Date().toISOString(),
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: MONTHLY_PRICE_USD_CENTS,
            recurring: {
              interval: 'month',
            },
            product_data: {
              name: 'Doctor Pro Subscription',
              description: 'Access to doctor dashboard and bookings management',
            },
          },
        },
      ],
      success_url: `${origin}/api/stripe/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/doctor/subscription?canceled=1`,
      metadata: {
        doctorId: state.id,
      },
      subscription_data: {
        metadata: {
          doctorId: state.id,
        },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

