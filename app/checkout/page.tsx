'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getCart, clearCart } from '@/lib/cart';
import { createOrder } from '@/lib/orders';
import type { Cart } from '@/types/cart';
import type { ShippingAddress } from '@/types/order';

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

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart>({ items: [], total: 0, itemCount: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        price: item.product.price,
      }));

      // Create order (payment will be handled separately)
      const order = await createOrder({
        total_amount: cart.total,
        shipping_address: shippingAddress,
        items: orderItems,
      });

      // Clear cart
      clearCart();

      // Redirect to payment
      router.push(`/checkout/payment?orderId=${order.id}`);
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
              {loading ? 'Obrađuje se...' : 'Nastavi na plaćanje'}
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
                  <span>{(item.product.price * item.quantity).toFixed(2)} €</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Ukupno:</span>
                <span>{cart.total.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

