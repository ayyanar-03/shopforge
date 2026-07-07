import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cartService } from '../services/cart.service';
import type { CartItem, CouponResult, PaymentMethod } from '../types/cart.types';
import { formatINR } from '../utils/currency';
import { getProductImage } from '../utils/productImage';

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cod: 'Cash on Delivery',
  stripe: 'Stripe (test mode)',
  razorpay: 'Razorpay (test mode)',
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState<CouponResult | null>(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const navigate = useNavigate();

  const fetchCart = async () => {
    const data = await cartService.getCart();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    void fetchCart();
  }, []);

  const subtotal = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    setCouponError('');
    setCoupon(null);
    try {
      const data = await cartService.validateCoupon(couponInput.trim(), subtotal);
      setCoupon(data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setCouponError(msg ?? 'Invalid coupon code');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  const removeItem = async (id: number) => {
    await cartService.removeItem(id);
    if (coupon) removeCoupon();
    void fetchCart();
  };

  const checkout = async () => {
    setCheckingOut(true);
    try {
      await cartService.checkout({
        paymentMethod,
        idempotencyKey,
        ...(coupon ? { couponCode: coupon.code } : {}),
      });
      navigate('/orders');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? 'Checkout failed');
      setCheckingOut(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500 text-sm">Loading cart...</div>
      </div>
    );

  const total = coupon ? coupon.finalTotal : subtotal;

  return (
    <div className="bg-gray-100 min-h-screen">
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Cart</h1>

      {items.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 py-16 text-center text-gray-500">
          <svg className="w-14 h-14 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" strokeLinejoin="round" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <p className="text-lg font-semibold mb-1">Your cart is empty</p>
          <p className="text-sm text-gray-400 mb-4">Add items you like to your cart</p>
          <a href="/products" className="inline-block px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-md hover:bg-orange-600 no-underline transition-colors">
            Continue Shopping
          </a>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-4 px-5 py-4">
                <Link to={`/products/${item.product.id}`} className="shrink-0">
                  <img
                    src={getProductImage({ id: item.product.id, price: Number(item.product.price), imageUrl: item.product.imageUrl, category: item.product.category })}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-100"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product.id}`} className="no-underline">
                    <p className="font-medium text-gray-900 hover:text-orange-600 transition-colors line-clamp-2">{item.product.name}</p>
                  </Link>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {formatINR(Number(item.product.price))} × {item.quantity}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="font-semibold text-gray-900">
                    {formatINR(Number(item.product.price) * item.quantity)}
                  </span>
                  <button
                    onClick={() => void removeItem(item.id)}
                    className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Coupon code */}
          <div className="border-t border-gray-100 px-5 py-4">
            {coupon ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
                <div>
                  <span className="text-sm font-semibold text-green-700">{coupon.code}</span>
                  <span className="ml-2 text-sm text-green-600">
                    −{formatINR(coupon.discountAmount)}
                    {coupon.type === 'percentage' ? ` (${coupon.value}% off)` : ' off'}
                  </span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-green-600 hover:text-green-800 ml-3"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && void applyCoupon()}
                  placeholder="Coupon code"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
                />
                <button
                  onClick={() => void applyCoupon()}
                  disabled={applyingCoupon || !couponInput.trim()}
                  className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {applyingCoupon ? 'Checking…' : 'Apply'}
                </button>
              </div>
            )}
            {couponError && <p className="text-red-600 text-xs mt-1.5">{couponError}</p>}
          </div>

          {/* Payment method */}
          <div className="border-t border-gray-100 px-5 py-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Payment method
            </p>
            <div className="flex flex-col gap-2">
              {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map((method) => (
                <label key={method} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-gray-700">{PAYMENT_LABELS[method]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Totals + checkout */}
          <div className="border-t border-gray-200 px-5 py-4 bg-gray-50">
            {coupon && (
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
            )}
            {coupon && (
              <div className="flex justify-between text-sm text-green-600 mb-2">
                <span>Discount ({coupon.code})</span>
                <span>−{formatINR(coupon.discountAmount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-xl font-bold text-gray-900">{formatINR(total)}</p>
              </div>
              <button
                onClick={() => void checkout()}
                disabled={checkingOut}
                className="px-6 py-2.5 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {checkingOut ? 'Placing order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
