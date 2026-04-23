'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getCart, clearCart } from '@/lib/cart';
import { createOrder } from '@/lib/orders';
import {
  calculateShipping,
  calculateOrderTotal,
  calculateDiscountedPrice,
  FREE_SHIPPING_THRESHOLD,
} from '@/lib/pricing';
import type { Cart } from '@/types/cart';
import type { ShippingAddress, PaymentMethod } from '@/types/order';

const checkoutSchema = z.object({
  full_name: z.string().min(1, 'Ime je obavezno'),
  email: z.string().email('Nevažeći email'),
  phone: z.string().min(1, 'Telefon je obavezan'),
  address_line1: z.string().min(1, 'Adresa je obavezna'),
  address_line2: z.string().optional(),
  city: z.string().min(1, 'Grad je obavezan'),
  postal_code: z.string().min(1, 'Poštanski broj je obavezan'),
  country: z.string().min(1, 'Država je obavezna'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGuestCheckout = searchParams.get('guest') === '1';
  const [cart, setCart] = useState<Cart>({ items: [], total: 0, itemCount: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    isGuestCheckout ? 'cash_on_delivery' : 'card'
  );
  const shipping = calculateShipping(cart.total);
  const orderTotal = calculateOrderTotal(cart.total);
  const amountUntilFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cart.total);
  const freeShippingProgress = Math.min(
    100,
    (cart.total / FREE_SHIPPING_THRESHOLD) * 100
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  useEffect(() => {
    const currentCart = getCart();
    if (currentCart.items.length === 0) {
      router.push('/cart');
      return;
    }
    setCart(currentCart);
  }, [router]);

  useEffect(() => {
    if (isGuestCheckout) {
      setPaymentMethod('cash_on_delivery');
    }
  }, [isGuestCheckout]);

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      setLoading(true);
      setError(null);

      const shippingAddress: ShippingAddress = {
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        address_line1: data.address_line1,
        address_line2: data.address_line2,
        city: data.city,
        postal_code: data.postal_code,
        country: data.country,
      };

      const orderItems = cart.items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: calculateDiscountedPrice(item.product.price, item.product.discount_percentage),
      }));

      // Create order (payment will be handled separately)
      const order = await createOrder({
        total_amount: orderTotal,
        shipping_address: shippingAddress,
        items: orderItems,
        payment_method: paymentMethod,
      });

      // Clear cart
      clearCart();

      if (paymentMethod === 'card') {
        const guestQuery = isGuestCheckout ? '&guest=1' : '';
        router.push(`/checkout/payment?orderId=${order.id}&amount=${order.total_amount}${guestQuery}`);
      } else {
        router.push(`/checkout/success?orderId=${order.id}&paymentMethod=cash_on_delivery`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri kreiranju narudžbe');
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <h2 className="text-xl font-semibold mb-4">Podaci za dostavu</h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            {isGuestCheckout && (
              <div className="bg-blue-100 border border-blue-300 text-blue-800 px-4 py-3 rounded text-sm">
                Nastavljate kao gost. Odaberite nacin placanja i dovrsite narudzbu bez registracije.
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Ime i prezime *</label>
              <input
                {...register('full_name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.full_name && (
                <p className="text-red-600 text-sm mt-1">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Telefon *</label>
              <input
                type="tel"
                {...register('phone')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Adresa *</label>
              <input
                {...register('address_line1')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.address_line1 && (
                <p className="text-red-600 text-sm mt-1">{errors.address_line1.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Adresa 2</label>
              <input
                {...register('address_line2')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Grad *</label>
                <input
                  {...register('city')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.city && (
                  <p className="text-red-600 text-sm mt-1">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Poštanski broj *</label>
                <input
                  {...register('postal_code')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.postal_code && (
                  <p className="text-red-600 text-sm mt-1">{errors.postal_code.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Država *</label>
              <input
                {...register('country')}
                defaultValue="Hrvatska"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.country && (
                <p className="text-red-600 text-sm mt-1">{errors.country.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-lg hover:from-primary-500 hover:to-primary-600 transition-all duration-200 font-semibold shadow-elegant disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Obrađuje se...'
                : paymentMethod === 'card'
                  ? 'Nastavi na plaćanje'
                  : 'Potvrdi narudžbu'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Sažetak narudžbe</h2>
            <div className="space-y-2 mb-4">
              {cart.items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span>
                    {item.product.name} x {item.quantity}
                  </span>
                  <span>
                    {(
                      calculateDiscountedPrice(item.product.price, item.product.discount_percentage) *
                      item.quantity
                    ).toFixed(2)} €
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="mb-3">
                <p className="text-sm font-medium mb-2">Način plaćanja</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="payment-method"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                    />
                    <span>Karticom</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="payment-method"
                      value="cash_on_delivery"
                      checked={paymentMethod === 'cash_on_delivery'}
                      onChange={() => setPaymentMethod('cash_on_delivery')}
                    />
                    <span>Pouzećem</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>Subtotal:</span>
                <span>{cart.total.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>Poštarina:</span>
                <span>{shipping === 0 ? 'Besplatno' : `${shipping.toFixed(2)} €`}</span>
              </div>
              <p className="text-xs text-gray-500 mb-2">
                Besplatna poštarina za narudžbe od {FREE_SHIPPING_THRESHOLD.toFixed(2)} €.
              </p>
              <div className="bg-primary-50 rounded px-2 py-2 mb-2">
                {amountUntilFreeShipping > 0 ? (
                  <p className="text-xs text-primary-700 mb-2">
                    Još samo <strong>{amountUntilFreeShipping.toFixed(2)} €</strong> te dijeli od{' '}
                    <strong>BESPLATNE dostave</strong>.
                  </p>
                ) : (
                  <p className="text-xs text-green-700 mb-2 font-semibold">
                    Odlično! Ostvario/la si BESPLATNU dostavu.
                  </p>
                )}
                <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      amountUntilFreeShipping > 0
                        ? 'bg-gradient-to-r from-primary-500 to-accent-500'
                        : 'bg-gradient-to-r from-green-500 to-emerald-500'
                    }`}
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-xl font-bold">
                <span>Ukupno:</span>
                <span>{orderTotal.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <p className="text-lg">Učitavanje...</p>
        </div>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}

