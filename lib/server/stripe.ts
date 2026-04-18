import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export function getStripeServer() {
  if (stripeClient) {
    return stripeClient;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY in your .env file.');
  }

  stripeClient = new Stripe(secretKey, {
    apiVersion: '2025-08-27.basil',
  });

  return stripeClient;
}

