import { useEffect, useState } from 'react';
import { orderService } from '../services/order.service';
import { productService } from '../services/product.service';
import type { Order } from '../types/order.types';
import { formatINR } from '../utils/currency';

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-amber-100 text-amber-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const PAYMENT_STATUS_STYLE: Record<string, string> = {
  pending: 'text-amber-600',
  paid: 'text-green-600',
  failed: 'text-red-600',
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cod: 'Cash on Delivery',
  stripe: 'Stripe',
  razorpay: 'Razorpay',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [productNames, setProductNames] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService
      .getOrders()
      .then(async (data) => {
        setOrders(data);
        const ids = [...new Set(data.flatMap((o) => o.items.map((i) => i.productId)))];
        const results = await Promise.allSettled(ids.map((id) => productService.getProduct(id)));
        const names: Record<number, string> = {};
        results.forEach((r, i) => {
          if (r.status === 'fulfilled') names[ids[i]] = r.value.name;
        });
        setProductNames(names);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500 text-sm">Loading orders...</div>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg mb-3">No orders yet.</p>
          <a href="/products" className="text-blue-600 hover:underline text-sm">
            Start shopping
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                <div>
                  <span className="font-semibold text-gray-900">Order {order.id}</span>
                  <span className="ml-3 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-50">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between px-5 py-3 text-sm">
                    <span className="text-gray-700">
                      {productNames[item.productId] ?? `Product ${item.productId}`}{' '}
                      <span className="text-gray-400">× {item.quantity}</span>
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatINR(Number(item.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-end justify-between gap-4">
                <div className="text-xs text-gray-500 space-y-0.5">
                  <div>
                    <span className="font-medium">Payment:</span>{' '}
                    {PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}
                    {' · '}
                    <span className={PAYMENT_STATUS_STYLE[order.paymentStatus] ?? 'text-gray-500'}>
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </div>
                  {order.couponCode && (
                    <div className="text-green-600">
                      Coupon <span className="font-mono font-semibold">{order.couponCode}</span>
                      {' — '}{formatINR(Number(order.discount))} off
                    </div>
                  )}
                </div>
                <div className="text-right">
                  {Number(order.discount) > 0 && !order.couponCode && (
                    <div className="text-xs text-green-600 mb-0.5">
                      Discount: −{formatINR(Number(order.discount))}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Total</span>
                    <span className="font-bold text-gray-900">{formatINR(Number(order.total))}</span>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
