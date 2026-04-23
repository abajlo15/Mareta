'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { fetchOrder } from '@/lib/orders';
import type { OrderWithItems } from '@/types/order';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ orderId, amount, isGuest }: { orderId: string; amount: number; isGuest: boolean }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment intent
      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amount: Math.round(amount * 100),
          orderId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

      // Confirm payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (paymentIntent?.status === 'succeeded') {
        // Update order with payment intent ID
        await fetch('/api/orders/update-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId,
            paymentIntentId: paymentIntent.id,
            guest: isGuest,
          }),
        });

        router.push(`/checkout/success?orderId=${orderId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white p-4 rounded-lg border border-gray-300">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-lg hover:from-primary-500 hover:to-primary-600 transition-all duration-200 font-semibold shadow-elegant disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Obrađuje se...' : `Plati ${amount.toFixed(2)} €`}
      </button>
    </form>
  );
}

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const isGuest = searchParams.get('guest') === '1';
  const guestAmountParam = searchParams.get('amount');
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [guestAmount, setGuestAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isGuest) {
      const parsedAmount = Number(guestAmountParam);
      if (orderId && Number.isFinite(parsedAmount) && parsedAmount > 0) {
        setGuestAmount(parsedAmount);
        setLoading(false);
      } else {
        router.push('/checkout?guest=1');
      }
      return;
    }

    if (orderId) {
      loadOrder(orderId);
    } else {
      router.push('/checkout');
    }
  }, [orderId, router, isGuest, guestAmountParam]);

  const loadOrder = async (id: string) => {
    try {
      const data = await fetchOrder(id);
      setOrder(data);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || (!isGuest && !order) || (isGuest && (!orderId || guestAmount === null))) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <p className="text-lg">Učitavanje...</p>
        </div>
      </div>
    );
  }

  const amountToPay = isGuest ? guestAmount! : order!.total_amount;
  const orderIdToShow = orderId ?? order!.id;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Plaćanje</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <p className="text-lg font-semibold mb-2">
            Ukupno za plaćanje: {amountToPay.toFixed(2)} €
          </p>
          <p className="text-sm text-gray-600">
            Narudžba #{orderIdToShow.slice(0, 8)}
          </p>
        </div>
        <Elements stripe={stripePromise}>
          <CheckoutForm orderId={orderIdToShow} amount={amountToPay} isGuest={isGuest} />
        </Elements>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <p className="text-lg">Učitavanje...</p>
        </div>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}
