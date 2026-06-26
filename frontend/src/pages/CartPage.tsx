import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

interface CartItem {
  id: number;
  quantity: number;
  product: { id: number; name: string; price: number };
}

interface CouponResult {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  discountAmount: number;
  finalTotal: number;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState<CouponResult | null>(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const navigate = useNavigate();

  const fetchCart = async () => {
    const { data } = await api.get<CartItem[]>('/cart');
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchCart();
  }, []);

  const subtotal = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    setCouponError('');
    setCoupon(null);
    try {
      const { data } = await api.post<CouponResult>('/coupons/validate', {
        code: couponInput.trim(),
        total: subtotal,
      });
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
    await api.delete(`/cart/${id}`);
    if (coupon) removeCoupon();
    void fetchCart();
  };

  const checkout = async () => {
    setCheckingOut(true);
    try {
      await api.post('/orders', coupon ? { couponCode: coupon.code } : {});
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
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg mb-3">Your cart is empty.</p>
          <a href="/products" className="text-blue-600 hover:underline text-sm">
            Browse products
          </a>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-medium text-gray-900">{item.product.name}</p>
                  <p className="text-sm text-gray-500">
                    ${Number(item.product.price).toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-gray-900">
                    ${(Number(item.product.price) * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => void removeItem(item.id)}
                    className="text-sm text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
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
                    −${coupon.discountAmount.toFixed(2)}
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

          {/* Totals + checkout */}
          <div className="border-t border-gray-200 px-5 py-4 bg-gray-50">
            {coupon && (
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            )}
            {coupon && (
              <div className="flex justify-between text-sm text-green-600 mb-2">
                <span>Discount ({coupon.code})</span>
                <span>−${coupon.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-xl font-bold text-gray-900">${total.toFixed(2)}</p>
              </div>
              <button
                onClick={() => void checkout()}
                disabled={checkingOut}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {checkingOut ? 'Placing order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
