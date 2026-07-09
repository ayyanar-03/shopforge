import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/order.service';
import { productService } from '../services/product.service';
import type { Order } from '../types/order.types';
import { formatINR } from '../utils/currency';
import { getProductImage } from '../utils/productImage';

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cod: 'Cash on Delivery',
  stripe: 'Stripe',
  razorpay: 'Razorpay',
};

/* ─── Tracking ──────────────────────────────────────────────────────────── */
const TRACKING_STEPS = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

const STATUS_TO_STEP: Record<string, number> = {
  pending: 0, confirmed: 1, shipped: 2, delivered: 3, cancelled: -1,
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

interface ProductInfo { name: string; imageUrl?: string | null; category?: string | null; }

function GSTReceipt({ order, products }: { order: Order; products: Record<number, ProductInfo> }) {
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
              <td className="py-1 text-gray-700">{products[item.productId]?.name ?? `Product ${item.productId}`}</td>
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

/* ─── Return Policy Modal ───────────────────────────────────────────────── */
function ReturnPolicyModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Return Policy</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
            </svg>
            <div>
              <p className="font-semibold text-gray-900">7-Day Return Window</p>
              <p className="text-gray-500">Returns accepted within 7 days of delivery for eligible items.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <div>
              <p className="font-semibold text-gray-900">Condition</p>
              <p className="text-gray-500">Items must be unused, in original packaging with tags intact.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
            </svg>
            <div>
              <p className="font-semibold text-gray-900">Refund</p>
              <p className="text-gray-500">Refund processed within 5–7 business days to original payment method.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>
            </svg>
            <div>
              <p className="font-semibold text-gray-900">Non-Returnable</p>
              <p className="text-gray-500">Perishables, digital goods, and personalised items are not eligible.</p>
            </div>
          </div>
        </div>
        <p className="mt-4 text-xs text-gray-400">To initiate a return, contact support at support@shopforge.in</p>
        <button onClick={onClose} className="mt-4 w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg text-sm transition-colors">
          Got it
        </button>
      </div>
    </div>
  );
}

/* ─── Return Request Modal ──────────────────────────────────────────────── */
const RETURN_REASONS = [
  'Item damaged or defective',
  'Wrong item received',
  'Item not as described',
  'No longer needed',
  'Other',
];

function ReturnRequestModal({ onClose }: { onClose: () => void }) {
  const [reason, setReason] = useState(RETURN_REASONS[0]);
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center">
          <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
          </svg>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Return Request Submitted</h2>
          <p className="text-sm text-gray-600">
            Our team will collect your item, and the amount will be refunded within 24 hours after receiving the product.
          </p>
          <button
            onClick={onClose}
            className="mt-5 w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Request Return</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Why are you returning this?</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              {RETURN_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Additional details (optional)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              placeholder="Tell us more…"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            Submit Return Request
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── Status ────────────────────────────────────────────────────────────── */
const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  shipped: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  delivered: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const PAYMENT_STATUS_COLOR: Record<string, string> = {
  pending: 'text-amber-600',
  paid: 'text-green-600',
  failed: 'text-red-600',
};

/* ─── Main ──────────────────────────────────────────────────────────────── */
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Record<number, ProductInfo>>({});
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [showReturnPolicy, setShowReturnPolicy] = useState(false);
  const [returnOrderId, setReturnOrderId] = useState<number | null>(null);

  const loadOrders = async () => {
    const data = await orderService.getOrders();
    setOrders(data);
    const ids = [...new Set(data.flatMap((o) => o.items.map((i) => i.productId)))];
    const results = await Promise.allSettled(ids.map((id) => productService.getProduct(id)));
    const info: Record<number, ProductInfo> = {};
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        const p = r.value;
        info[ids[i]] = { name: p.name, imageUrl: p.imageUrl, category: p.category };
      }
    });
    setProducts(info);
    if (data.length > 0) setExpandedOrder(data[0].id);
  };

  useEffect(() => {
    loadOrders().finally(() => setLoading(false));
  }, []);

  const handleCancel = async (orderId: number) => {
    if (!confirm('Cancel this order?')) return;
    setCancelling(orderId);
    try {
      const updated = await orderService.cancelOrder(orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o)));
    } catch {
      alert('Could not cancel order. Please try again.');
    } finally {
      setCancelling(null);
    }
  };

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
      {showReturnPolicy && <ReturnPolicyModal onClose={() => setShowReturnPolicy(false)} />}
      {returnOrderId !== null && <ReturnRequestModal onClose={() => setReturnOrderId(null)} />}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          {orders.length > 0 && (
            <span className="text-sm text-gray-500">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            {
              icon: <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M5 12H3l9-9 9 9h-2v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7z"/><path d="M9 22V12h6v10"/></svg>,
              label: 'Free Delivery', sub: 'On orders ₹499+',
            },
            {
              icon: <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>,
              label: '7-Day Returns', sub: 'Easy returns',
            },
            {
              icon: <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
              label: 'Secure Payment', sub: '100% protected',
            },
          ].map(({ icon, label, sub }) => (
            <div key={label} className="bg-white rounded-lg border border-gray-200 p-3 flex items-center gap-3">
              {icon}
              <div>
                <p className="text-xs font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            </div>
          ))}
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
              const canCancel = order.status === 'pending';
              const isDelivered = order.status === 'delivered';

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
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_BADGE[order.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        {canCancel && (
                          <button
                            onClick={() => void handleCancel(order.id)}
                            disabled={cancelling === order.id}
                            className="text-xs text-red-600 border border-red-200 hover:bg-red-50 font-medium px-2.5 py-1 rounded-full transition-colors disabled:opacity-60"
                          >
                            {cancelling === order.id ? 'Cancelling…' : 'Cancel Order'}
                          </button>
                        )}
                        {isDelivered && (
                          <button
                            onClick={() => setShowReturnPolicy(true)}
                            className="text-xs text-blue-600 border border-blue-200 hover:bg-blue-50 font-medium px-2.5 py-1 rounded-full transition-colors"
                          >
                            Return Policy
                          </button>
                        )}
                        {isDelivered && (
                          <button
                            onClick={() => setReturnOrderId(order.id)}
                            className="text-xs text-orange-600 border border-orange-200 hover:bg-orange-50 font-medium px-2.5 py-1 rounded-full transition-colors"
                          >
                            Return
                          </button>
                        )}
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
                    <div className="space-y-3">
                      {order.items.slice(0, isExpanded ? undefined : 2).map((item) => {
                        const prod = products[item.productId];
                        const imgSrc = getProductImage({
                          id: item.productId,
                          price: Number(item.price),
                          imageUrl: prod?.imageUrl,
                          category: prod?.category ?? undefined,
                        });
                        return (
                          <div key={item.id} className="flex items-center gap-3">
                            <Link to={`/products/${item.productId}`} className="shrink-0">
                              <img
                                src={imgSrc}
                                alt={prod?.name ?? 'Product'}
                                className="w-14 h-14 object-cover rounded-lg border border-gray-100"
                              />
                            </Link>
                            <div className="flex-1 min-w-0">
                              <Link to={`/products/${item.productId}`} className="no-underline">
                                <p className="text-sm font-medium text-gray-900 hover:text-orange-600 transition-colors line-clamp-1">
                                  {prod?.name ?? `Product ${item.productId}`}
                                </p>
                              </Link>
                              <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                            </div>
                            <span className="text-sm font-semibold text-gray-900 shrink-0">
                              {formatINR(Number(item.price) * item.quantity)}
                            </span>
                          </div>
                        );
                      })}
                      {!isExpanded && order.items.length > 2 && (
                        <p className="text-xs text-gray-400 mt-1">+{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}</p>
                      )}
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
                        {isDelivered && (
                          <p className="text-xs text-green-600 font-medium mt-2 text-center">
                            Delivered on {orderDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        )}
                        {(order.status === 'shipped' || order.status === 'confirmed') && (
                          <p className="text-xs text-indigo-600 font-medium mt-2 text-center">
                            Expected delivery: {new Date(orderDate.getTime() + 3 * 86400000).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </p>
                        )}
                      </div>

                      {/* GST Receipt */}
                      <div>
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mt-3 mb-1">GST Invoice</p>
                        <GSTReceipt order={order} products={products} />
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
