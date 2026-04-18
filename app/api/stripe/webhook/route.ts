import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripeServer } from '@/lib/server/stripe';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ error: 'Missing STRIPE_WEBHOOK_SECRET' }, { status: 500 });
    }

    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
    }

    const payload = await request.text();
    const stripe = getStripeServer();
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const doctorId = session.metadata?.doctorId;
      if (doctorId) {
        await adminDb.collection('doctors').doc(doctorId).set(
          {
            status: 'verified',
            verificationStatus: 'verified',
            subscriptionStatus: 'active',
            subscriptionActive: true,
            stripeCustomerId: typeof session.customer === 'string' ? session.customer : null,
            stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : null,
            subscriptionUpdatedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        );
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const doctorQuery = await adminDb
        .collection('doctors')
        .where('stripeSubscriptionId', '==', subscription.id)
        .limit(1)
        .get();

      if (!doctorQuery.empty) {
        await doctorQuery.docs[0].ref.set(
          {
            subscriptionStatus: 'canceled',
            subscriptionActive: false,
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}

