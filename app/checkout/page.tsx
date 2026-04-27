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
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().min(1, 'Država je obavezna'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;
type ShippingMethod = 'standard' | 'boxnow_locker';
type CheckoutPaymentOption = 'cash_on_delivery' | 'boxnow_card';

type BoxNowSelection = {
  id: string;
  name?: string;
  address?: string;
};

type BoxNowWidgetSelection = {
  boxnowLockerId?: string;
  boxnowLockerAddressLine1?: string;
  boxnowLockerPostalCode?: string;
  boxnowLockerName?: string;
  name?: string;
};

declare global {
  interface Window {
    _bn_map_widget_config?: {
      partnerId: number;
      parentElement: string;
      type?: 'iframe' | 'popup' | 'navigate';
      buttonSelector?: string;
      autoclose?: boolean;
      afterSelect: (selected: BoxNowWidgetSelection) => void;
    };
    boxnowWidgetV5?: { destroy?: () => void };
  }
}

function parseMaybeJson(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function normalizeLockerId(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(Math.trunc(value));
  }
  if (typeof value !== 'string') return '';
  const raw = value.trim();
  if (!raw) return '';
  if (/^\d+$/.test(raw)) return raw;
  const match = raw.match(/\d+/);
  return match ? match[0] : '';
}

function extractBoxNowSelection(raw: unknown): BoxNowSelection | null {
  const payload = parseMaybeJson(raw);
  if (!payload || typeof payload !== 'object') return null;
  const record = payload as Record<string, unknown>;
  const nestedCandidates: unknown[] = [
    record.data,
    record.payload,
    record.detail,
    record.selectedPoint,
    record.selectedLocker,
    record.point,
  ];
  const normalizedCandidates: Array<Record<string, unknown>> = [
    record,
    ...nestedCandidates
      .map(parseMaybeJson)
      .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object'),
  ];

  for (const candidate of normalizedCandidates) {
    const id =
      normalizeLockerId(candidate.boxnowPointId) ||
      normalizeLockerId(candidate.boxnowLockerId) ||
      normalizeLockerId(candidate.selectedLockerId) ||
      normalizeLockerId(candidate.lockerId) ||
      normalizeLockerId(candidate.pickupPointId) ||
      normalizeLockerId(candidate.locationId);
    if (!id) continue;

    const name =
      (typeof candidate.name === 'string' && candidate.name) ||
      (typeof candidate.lockerName === 'string' && candidate.lockerName) ||
      (typeof candidate.title === 'string' && candidate.title) ||
      undefined;
    const address =
      (typeof candidate.address === 'string' && candidate.address) ||
      (typeof candidate.lockerAddress === 'string' && candidate.lockerAddress) ||
      undefined;

    return { id, name, address };
  }

  return null;
}

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGuestCheckout = searchParams.get('guest') === '1';
  const [cart, setCart] = useState<Cart>({ items: [], total: 0, itemCount: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [boxNowSelection, setBoxNowSelection] = useState<BoxNowSelection | null>(null);
  const [boxNowInput, setBoxNowInput] = useState('');
  const [paymentOption, setPaymentOption] = useState<CheckoutPaymentOption>('cash_on_delivery');
  const [showBoxNowWidget, setShowBoxNowWidget] = useState(false);
  const [boxNowWidgetNonce, setBoxNowWidgetNonce] = useState(0);
  const isBoxNowSelected = paymentOption === 'boxnow_card';
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
      setPaymentOption('cash_on_delivery');
    }
  }, [isGuestCheckout]);

  useEffect(() => {
    if (!isBoxNowSelected) {
      setShowBoxNowWidget(false);
    }
  }, [isBoxNowSelected]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!event.origin.includes('boxnow.hr')) return;
      const selection = extractBoxNowSelection(event.data);
      if (!selection?.id) return;
      setBoxNowSelection(selection);
      setBoxNowInput(selection.id);
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    if (!showBoxNowWidget || !isBoxNowSelected) return;

    window._bn_map_widget_config = {
      partnerId: 8816,
      parentElement: '#boxnowmap',
      type: 'iframe',
      autoclose: false,
      afterSelect: (selected: BoxNowWidgetSelection) => {
        const id =
          normalizeLockerId(selected.boxnowLockerId) ||
          normalizeLockerId((selected as unknown as Record<string, unknown>).locationId) ||
          normalizeLockerId((selected as unknown as Record<string, unknown>).boxnowPointId);
        if (!id) return;
        const name = selected.boxnowLockerName || selected.name;
        const addressParts = [
          selected.boxnowLockerAddressLine1,
          selected.boxnowLockerPostalCode,
        ].filter(Boolean);
        setBoxNowSelection({
          id,
          name,
          address: addressParts.length ? addressParts.join(', ') : undefined,
        });
        setBoxNowInput(id);
      },
    };

    const existingScript = document.getElementById('boxnow-widget-v5-script');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = 'boxnow-widget-v5-script';
    script.src = `https://widget-cdn.boxnow.hr/map-widget/client/v5.js?v=${Date.now()}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Trigger official widget button once script attaches listeners.
      window.setTimeout(() => {
        const trigger = document.querySelector('.boxnow-map-widget-button') as HTMLElement | null;
        trigger?.click();
      }, 50);
    };
    script.onerror = () => {};
    document.head.appendChild(script);
  }, [showBoxNowWidget, isBoxNowSelected, boxNowWidgetNonce]);

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      setLoading(true);
      setError(null);

      if (!isBoxNowSelected) {
        if (!data.address_line1?.trim()) {
          setError('Adresa je obavezna.');
          setLoading(false);
          return;
        }
        if (!data.city?.trim()) {
          setError('Grad je obavezan.');
          setLoading(false);
          return;
        }
        if (!data.postal_code?.trim()) {
          setError('Poštanski broj je obavezan.');
          setLoading(false);
          return;
        }
      }

      const shippingAddress: ShippingAddress = {
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        address_line1: isBoxNowSelected
          ? (boxNowSelection?.address || 'BoxNow paketomat')
          : (data.address_line1 || ''),
        address_line2: isBoxNowSelected
          ? (boxNowSelection?.name || undefined)
          : data.address_line2,
        city: isBoxNowSelected ? 'BoxNow paketomat' : (data.city || ''),
        postal_code: isBoxNowSelected ? '00000' : (data.postal_code || ''),
        country: data.country,
      };

      const orderItems = cart.items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: calculateDiscountedPrice(item.product.price, item.product.discount_percentage),
      }));

      const isBoxNow = isBoxNowSelected;
      const shippingMethod: ShippingMethod = isBoxNow ? 'boxnow_locker' : 'standard';
      const selectedLockerId = normalizeLockerId(boxNowSelection?.id || boxNowInput);
      if (isBoxNow && !selectedLockerId) {
        setError('Za BoxNow dostavu potrebno je odabrati paketomat.');
        setLoading(false);
        return;
      }
      // BoxNow "karticom" flow is handled by BoxNow at pickup/link, so locally we confirm like COD.
      const resolvedPaymentMethod: PaymentMethod =
        isBoxNow ? 'cash_on_delivery' : 'cash_on_delivery';

      // Create order (payment will be handled separately)
      const order = await createOrder({
        total_amount: orderTotal,
        shipping_address: shippingAddress,
        items: orderItems,
        payment_method: resolvedPaymentMethod,
        shipping_provider: isBoxNow ? 'boxnow' : 'internal',
        shipping_method: shippingMethod,
        boxnow_locker_id: isBoxNow ? selectedLockerId : undefined,
        boxnow_locker_name: isBoxNow ? boxNowSelection?.name : undefined,
        boxnow_locker_address:
          isBoxNow ? boxNowSelection?.address : undefined,
        boxnow_payment_mode: isBoxNow ? 'cod' : undefined,
        boxnow_amount_to_be_collected:
          isBoxNow ? orderTotal : 0,
      });

      // Clear cart
      clearCart();

      await fetch('/api/orders/update-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          codConfirmed: true,
        }),
      });
      router.push(`/checkout/success?orderId=${order.id}&paymentMethod=cash_on_delivery`);
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

            {paymentOption === 'boxnow_card' && (
              <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm space-y-2">
                <p className="font-medium">Odabir BoxNow paketomata</p>
                <p>
                  Kliknite na widget i odaberite paketomat. Ako automatski odabir ne radi, zalijepite
                  ID paketomata ručno.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBoxNowWidget(true);
                      setBoxNowWidgetNonce((prev) => prev + 1);
                    }}
                    className="boxnow-map-widget-button inline-flex items-center rounded bg-amber-600 px-3 py-1.5 text-white hover:bg-amber-700"
                  >
                    Otvori BoxNow widget
                  </button>
                </div>
                <input
                  value={boxNowInput}
                  onChange={(e) => {
                    const normalized = normalizeLockerId(e.target.value);
                    setBoxNowInput(normalized);
                    setBoxNowSelection((prev) => {
                      if (!normalized) return prev ? { ...prev, id: '' } : null;
                      return prev ? { ...prev, id: normalized } : { id: normalized };
                    });
                  }}
                  placeholder="Unesite/zalijepite ID paketomata"
                  inputMode="numeric"
                  autoComplete="off"
                  spellCheck={false}
                  name="boxnow-locker-id"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    boxNowSelection?.id
                      ? 'border-emerald-400 bg-emerald-50 focus:ring-emerald-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {boxNowSelection?.id && (
                  <p className="text-xs text-emerald-700 font-medium">
                    Paketomat odabran.
                  </p>
                )}
                {boxNowSelection?.id && (
                  <p className="text-xs text-gray-700">
                    Odabrani paketomat: <strong>{boxNowSelection.id}</strong>
                    {boxNowSelection.name ? ` (${boxNowSelection.name})` : ''}
                  </p>
                )}
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

            {!isBoxNowSelected && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Adresa *</label>
                  <input
                    {...register('address_line1')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Poštanski broj *</label>
                    <input
                      {...register('postal_code')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </>
            )}

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
                : 'Potvrdi narudžbu'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md">
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
                      value="cash_on_delivery"
                      checked={paymentOption === 'cash_on_delivery'}
                      onChange={() => setPaymentOption('cash_on_delivery')}
                    />
                    <span>Pouzećem</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="payment-method"
                      value="boxnow"
                      checked={paymentOption === 'boxnow_card'}
                      onChange={() => setPaymentOption('boxnow_card')}
                      disabled={isGuestCheckout}
                    />
                    <span>BoxNow (Za plaćanje karticom molimo koristiti ovu opciju)</span>
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

          {showBoxNowWidget && paymentOption === 'boxnow_card' && (
            <div className="bg-white p-4 rounded-lg shadow-md mt-4">
              <h3 className="font-semibold mb-2">BoxNow widget</h3>
              <div
                id="boxnowmap"
                className="overflow-hidden rounded border border-slate-200 h-[720px]"
              />
            </div>
          )}
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

