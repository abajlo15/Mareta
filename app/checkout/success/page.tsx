'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const paymentMethod = searchParams.get('paymentMethod');
  const isCashOnDelivery = paymentMethod === 'cash_on_delivery';

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <h1 className="text-2xl font-bold mb-2">
            {isCashOnDelivery ? 'Narudžba uspješno zaprimljena!' : 'Plaćanje uspješno!'}
          </h1>
          <p>
            {isCashOnDelivery
              ? 'Odabrali ste plaćanje pouzećem. Hvala vam na kupovini.'
              : 'Hvala vam na kupovini.'}
          </p>
          {orderId && (
            <p className="text-sm mt-2">
              Broj narudžbe: #{orderId.slice(0, 8)}
            </p>
          )}
        </div>
        <div className="space-y-4">
          <p className="text-gray-600">
            Vaša narudžba je primljena i obrađuje se. Email potvrde će biti poslan na vašu adresu.
          </p>
          <div className="flex justify-center space-x-4">
            {orderId && (
              <Link
                href={`/orders/${orderId}`}
                className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg hover:from-primary-500 hover:to-primary-600 transition-all duration-200 font-semibold shadow-elegant"
              >
                Pregledaj narudžbu
              </Link>
            )}
            <Link
              href="/products"
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
            >
              Nastavi kupovinu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <p className="text-lg">Učitavanje...</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

