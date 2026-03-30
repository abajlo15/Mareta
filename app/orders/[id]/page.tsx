'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { fetchOrder } from '@/lib/orders';
import type { OrderWithItems } from '@/types/order';

const statusLabels: Record<string, string> = {
  pending: 'Na čekanju',
  paid: 'Plaćeno',
  shipped: 'Poslano',
  delivered: 'Dostavljeno',
  cancelled: 'Otkazano',
};

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadOrder(params.id as string);
    }
  }, [params.id]);

  const loadOrder = async (id: string) => {
    try {
      setLoading(true);
      const data = await fetchOrder(id);
      setOrder(data);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <p className="text-lg">Učitavanje narudžbe...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <p className="text-lg text-red-600">Narudžba nije pronađena</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Narudžba #{order.id.slice(0, 8)}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-soft mb-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Stavke narudžbe</h2>
            <div className="space-y-4">
              {order.order_items.map((item) => {
                const imageUrl =
                  item.product.images && item.product.images.length > 0
                    ? item.product.images[0]
                    : '/placeholder.svg';
                return (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 border-b pb-4 last:border-0"
                  >
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover rounded"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">
                        Količina: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {(item.price * item.quantity).toFixed(2)} €
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-soft space-y-4 border border-gray-100">
            <div>
              <h3 className="font-semibold mb-2">Status</h3>
              <p className="text-lg">{statusLabels[order.status] || order.status}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Datum</h3>
              <p className="text-gray-600">
                {new Date(order.created_at).toLocaleDateString('hr-HR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            {order.shipping_address && (
              <div>
                <h3 className="font-semibold mb-2">Adresa dostave</h3>
                <div className="text-gray-600 text-sm">
                  <p>{order.shipping_address.full_name}</p>
                  <p>{order.shipping_address.address_line1}</p>
                  {order.shipping_address.address_line2 && (
                    <p>{order.shipping_address.address_line2}</p>
                  )}
                  <p>
                    {order.shipping_address.postal_code}{' '}
                    {order.shipping_address.city}
                  </p>
                  <p>{order.shipping_address.country}</p>
                </div>
              </div>
            )}
            <div className="border-t pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Ukupno:</span>
                <span>{order.total_amount.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

