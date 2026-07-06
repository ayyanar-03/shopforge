import { useEffect, useState } from 'react';
import { orderService } from '../services/order.service';
import { productService } from '../services/product.service';
import type { Order } from '../types/order.types';
import { formatINR } from '../utils/currency';

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cod: 'Cash on Delivery',
  stripe: 'Stripe',
  razorpay: 'Razorpay',
};

/* ─── Shipment tracking ─────────────────────────────────────────────────── */
const TRACKING_STEPS = [
  { key: 'placed', label: 'Order Placed', icon: '📋' },
  { key: 'confirmed', label: 'Confirmed', icon: '✅' },
  { key: 'shipped', label: 'Shipped', icon: '📦' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚' },
  { key: 'delivered', label: 'Delivered', icon: '🏠' },
];

const STATUS_TO_STEP: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  shipped: 2,
  out_for_delivery: 3,
  delivered: 4,
  cancelled: -1,
};

function ShipmentTracker({ status }: { status: string }) {
  const currentStep = STATUS_TO_STEP[status] ?? 0;
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm font-medium">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" />
        </svg>
        Order Cancelled
      </div>
    );
  }
  return (
    <div className="relative flex items-start justify-between gap-1 overflow-x-auto pb-1">
      {TRACKING_STEPS.map((step, i) => {
        const isDone = i <= currentStep;
        const isCurrent = i === currentStep;
        return (
          <div key={step.key} className="flex flex-col items-center flex-1 min-w-[64px]">
            <div className="relative flex items-center w-full justify-center">
              {i > 0 && (
                <div className={`absolute right-1/2 top-4 h-0.5 w-full -translate-y-0.5 ${i <= currentStep ? 'bg-orange-400' : 'bg-gray-200'}`} />
              )}
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all ${
                isDone ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-gray-300 text-gray-400'
              } ${isCurrent ? 'ring-2 ring-orange-300 ring-offset-1' : ''}`}>
                {isDone ? (
                  i < currentStep ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )
                ) : (
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
                )}
              </div>
            </div>
            <span className={`text-xs mt-1.5 text-center leading-tight font-medium ${isDone ? 'text-orange-600' : 'text-gray-400'}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── GST Receipt ───────────────────────────────────────────────────────── */
const GST_RATE = 0.18;
const SHOPFORGE_GSTIN = '27AABCS1429B1ZB';

function invoiceNumber(orderId: number, date: string) {
  const year = new Date(date).getFullYear();
  return `SF/${year}-${String(year + 1).slice(2)}/${String(orderId).padStart(5, '0')}`;
}

function GSTReceipt({ order, productNames }: { order: Order; productNames: Record<number, string> }) {
  const totalINR = Math.round(Number(order.total) * 83.5);
  const taxable = Math.round(totalINR / (1 + GST_RATE));
  const totalGst = totalINR - taxable;
  const cgst = Math.round(totalGst / 2);
  const sgst = totalGst - cgst;

  return (
    <div className="mt-3 border border-dashed border-gray-300 rounded-lg p-4 text-xs text-gray-600 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-bold text-gray-900 text-sm">TAX INVOICE</p>
          <p className="text-gray-500">{invoiceNumber(order.id, order.createdAt)}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-800">ShopForge Pvt. Ltd.</p>
          <p className="text-gray-500">GSTIN: {SHOPFORGE_GSTIN}</p>
        </div>
      </div>
      <table className="w-full text-xs mb-3">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-1 font-semibold text-gray-700">Item</th>
            <th className="text-right py-1 font-semibold text-gray-700">Qty</th>
            <th className="text-right py-1 font-semibold text-gray-700">Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id} className="border-b border-gray-100">
              <td className="py-1 text-gray-700">{productNames[item.productId] ?? `Product ${item.productId}`}</td>
              <td className="py-1 text-right text-gray-600">{item.quantity}</td>
              <td className="py-1 text-right text-gray-800 font-medium">{formatINR(Number(item.price) * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="space-y-0.5">
        {order.couponCode && Number(order.discount) > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount ({order.couponCode})</span>
            <span>− {formatINR(Number(order.discount))}</span>
          </div>
        )}
        <div className="flex justify-between"><span>Taxable Amount</span><span>₹{taxable.toLocaleString('en-IN')}</span></div>
        <div className="flex justify-between"><span>CGST @ 9%</span><span>₹{cgst.toLocaleString('en-IN')}</span></div>
        <div className="flex justify-between"><span>SGST @ 9%</span><span>₹{sgst.toLocaleString('en-IN')}</span></div>
        <div className="flex justify-between font-bold text-gray-900 border-t border-gray-300 pt-1 mt-1 text-sm">
          <span>Total (Incl. GST)</span><span>{formatINR(Number(order.total))}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────────────── */
const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  shipped: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  out_for_delivery: 'bg-purple-100 text-purple-700 border-purple-200',
  delivered: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const PAYMENT_STATUS_COLOR: Record<string, string> = {
  pending: 'text-amber-600',
  paid: 'text-green-600',
  failed: 'text-red-600',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [productNames, setProductNames] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  useEffect(() => {
    orderService
      .getOrders()
      .then(async (data) => {
        setOrders(data);
        const ids = [...new Set(data.flatMap((o) => o.items.map((i) => i.productId)))];
        const results = await Promise.allSettled(ids.map((id) => productService.getProduct(id)));
        const names: Record<number, string> = {};
        results.forEach((r, i) => { if (r.status === 'fulfilled') names[ids[i]] = r.value.name; });
        setProductNames(names);
        if (data.length > 0) setExpandedOrder(data[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading your orders…</p>
        </div>
      </div>
    );

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          {orders.length > 0 && (
            <span className="text-sm text-gray-500">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-16 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path d="m16.5 9.4-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            <p className="text-lg font-semibold text-gray-700 mb-1">No orders yet</p>
            <p className="text-sm text-gray-500 mb-4">Once you place an order, it will appear here.</p>
            <a href="/products" className="inline-block px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-md hover:bg-orange-600 no-underline transition-colors">
              Start Shopping
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isExpanded = expandedOrder === order.id;
              const orderDate = new Date(order.createdAt);

              return (
                <div key={order.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* Order header */}
                  <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                        <div>
                          <p className="text-gray-400 uppercase tracking-wide font-semibold">Order placed</p>
                          <p className="font-semibold text-gray-800 text-sm">
                            {orderDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 uppercase tracking-wide font-semibold">Total</p>
                          <p className="font-bold text-gray-900 text-sm">{formatINR(Number(order.total))}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 uppercase tracking-wide font-semibold">Payment</p>
                          <p className={`font-semibold text-sm ${PAYMENT_STATUS_COLOR[order.paymentStatus] ?? 'text-gray-600'}`}>
                            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 uppercase tracking-wide font-semibold">Order No.</p>
                          <p className="font-mono font-semibold text-gray-800 text-sm">#{String(order.id).padStart(5, '0')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_BADGE[order.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                          {order.status === 'out_for_delivery' ? 'Out for Delivery' : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <button
                          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 hover:bg-blue-50 rounded transition-colors"
                        >
                          {isExpanded ? 'Collapse' : 'View Details'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order items summary */}
                  <div className="px-5 py-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {order.items.slice(0, isExpanded ? undefined : 2).map((item) => (
                          <div key={item.id} className="flex items-center gap-2 py-1 text-sm">
                            <div className="w-2 h-2 bg-orange-400 rounded-full shrink-0" />
                            <span className="text-gray-700">{productNames[item.productId] ?? `Product ${item.productId}`}</span>
                            <span className="text-gray-400">× {item.quantity}</span>
                            <span className="ml-auto font-medium text-gray-900">{formatINR(Number(item.price) * item.quantity)}</span>
                          </div>
                        ))}
                        {!isExpanded && order.items.length > 2 && (
                          <p className="text-xs text-gray-400 ml-4 mt-1">+{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 px-5 pb-5">
                      {/* Payment info */}
                      <div className="flex flex-wrap gap-4 py-3 text-xs text-gray-600 border-b border-gray-100">
                        <span>
                          <span className="font-semibold text-gray-700">Method:</span>{' '}
                          {PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}
                        </span>
                        {order.couponCode && (
                          <span className="text-green-600">
                            <span className="font-semibold">Coupon:</span>{' '}
                            <span className="font-mono">{order.couponCode}</span> — saved {formatINR(Number(order.discount))}
                          </span>
                        )}
                      </div>

                      {/* Shipment tracker */}
                      <div className="py-4 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Shipment Tracking</p>
                        <ShipmentTracker status={order.status} />
                        {order.status === 'delivered' && (
                          <p className="text-xs text-green-600 font-medium mt-2 text-center">
                            Delivered on {orderDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        )}
                        {order.status === 'shipped' && (
                          <p className="text-xs text-indigo-600 font-medium mt-2 text-center">
                            Expected delivery: {new Date(orderDate.getTime() + 3 * 86400000).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </p>
                        )}
                      </div>

                      {/* GST Receipt */}
                      <div>
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mt-3 mb-1">GST Invoice</p>
                        <GSTReceipt order={order} productNames={productNames} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
