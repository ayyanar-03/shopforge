import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../services/product.service';
import { cartService } from '../services/cart.service';
import { wishlistService } from '../services/wishlist.service';
import { reviewService } from '../services/review.service';
import type { Product } from '../types/product.types';
import type { ReviewsResponse } from '../types/review.types';
import { useAuth } from '../context/AuthContext';
import { getProductImage } from '../utils/productImage';
import { formatINR } from '../utils/currency';
import StarRating from '../components/StarRating';
import HeartButton from '../components/HeartButton';

/* ─── Size config ───────────────────────────────────────────────────────── */
const SIZE_MAP: Record<string, string[]> = {
  Clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  Sports: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  Baby: ['0-3M', '3-6M', '6-12M', '12-18M', '2Y', '3Y', '4Y'],
};

const GST_RATE = 0.18;

function gstBreakdown(priceUsd: number) {
  const inr = Math.round(priceUsd * 83.5);
  const taxable = Math.round(inr / (1 + GST_RATE));
  const totalGst = inr - taxable;
  const cgst = Math.round(totalGst / 2);
  const sgst = totalGst - cgst;
  return { taxable, cgst, sgst, totalGst };
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<ReviewsResponse | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [message, setMessage] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [wishlisted, setWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setProduct(null); setRelated([]); setReviews(null); setWishlisted(false); setSelectedSize('');
    productService.getProduct(Number(id)).then((data) => {
      setProduct(data);
      productService.getRelated(Number(id)).then((related) => setRelated(related ?? []));
    });
    reviewService.getProductReviews(Number(id), 20).then((data) => setReviews(data));
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    wishlistService.getWishlist().then((products) => setWishlisted(products.some((p) => p.id === Number(id))));
  }, [user, id]);

  const sizes = product?.category ? (SIZE_MAP[product.category] ?? []) : [];
  const needsSize = sizes.length > 0;
  const sizeSelected = !needsSize || selectedSize !== '';

  const toggleWishlist = async () => {
    if (!user) { navigate('/login'); return; }
    if (wishlisted) {
      await wishlistService.removeFromWishlist(Number(id));
      setWishlisted(false);
    } else {
      await wishlistService.addToWishlist(Number(id));
      setWishlisted(true);
    }
  };

  const addToCart = async () => {
    if (!user) { navigate('/login'); return; }
    if (needsSize && !selectedSize) {
      setMessage('Please select a size');
      return;
    }
    setIsAdding(true);
    try {
      await cartService.addItem(product!.id, quantity);
      setMessage('Added to cart successfully!');
      setTimeout(() => setMessage(''), 2500);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setMessage(msg ?? 'Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const submitReview = async () => {
    if (!user) { navigate('/login'); return; }
    if (myRating === 0) { setReviewError('Please select a star rating.'); return; }
    setIsSubmitting(true); setReviewError('');
    try {
      await reviewService.createReview(Number(id), myRating, myComment || undefined);
      setMyRating(0); setMyComment('');
      const data = await reviewService.getProductReviews(Number(id), 20);
      setReviews(data);
      if (product) setProduct({ ...product, averageRating: data.averageRating, reviewCount: data.reviewCount });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setReviewError(msg ?? 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product)
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading product…</p>
        </div>
      </div>
    );

  const priceINR = Math.round(Number(product.price) * 83.5);
  const mrp = Math.round(priceINR * 1.15);
  const discount = Math.round(((mrp - priceINR) / mrp) * 100);
  const { taxable, cgst, sgst } = gstBreakdown(Number(product.price));
  const hasReviews = reviews && reviews.data.length > 0;

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-1.5 text-xs text-gray-500">
          <Link to="/" className="hover:text-orange-500 no-underline transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-orange-500 no-underline transition-colors">Products</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-orange-500 no-underline transition-colors">
                {product.category}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-800 font-medium truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Product card */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
          <div className="grid md:grid-cols-5 gap-0">
            {/* Image panel */}
            <div className="md:col-span-2 bg-gray-50 p-4 flex items-center justify-center min-h-80">
              <img
                src={getProductImage(product)}
                alt={product.name}
                className="max-h-96 max-w-full object-contain rounded-lg"
              />
            </div>

            {/* Info panel */}
            <div className="md:col-span-3 p-6 flex flex-col">
              {product.category && (
                <Link
                  to={`/products?category=${encodeURIComponent(product.category)}`}
                  className="text-xs text-blue-600 font-semibold uppercase tracking-wide no-underline hover:text-blue-700 mb-2 inline-block"
                >
                  {product.category}
                </Link>
              )}

              <div className="flex items-start justify-between gap-3 mb-3">
                <h1 className="text-xl font-bold text-gray-900 leading-tight">{product.name}</h1>
                {user && (
                  <HeartButton wishlisted={wishlisted} onClick={() => void toggleWishlist()} size="md" />
                )}
              </div>

              {product.reviewCount > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <StarRating value={product.averageRating} size="sm" />
                  <span className="text-sm text-blue-600 font-medium">{Number(product.averageRating).toFixed(1)}</span>
                  <span className="text-sm text-gray-500">({product.reviewCount} ratings)</span>
                </div>
              )}

              <div className="border-t border-b border-gray-100 py-4 mb-4">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-bold text-gray-900">₹{priceINR.toLocaleString('en-IN')}</span>
                  <span className="text-base text-gray-400 line-through">₹{mrp.toLocaleString('en-IN')}</span>
                  <span className="text-base font-semibold text-green-600">{discount}% off</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes (GST)</p>
                <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                  <span>Taxable: ₹{taxable.toLocaleString('en-IN')}</span>
                  <span>CGST (9%): ₹{cgst.toLocaleString('en-IN')}</span>
                  <span>SGST (9%): ₹{sgst.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Size selector */}
              {needsSize && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-800">
                      Select Size
                      {selectedSize && <span className="ml-2 text-orange-500">{selectedSize}</span>}
                    </span>
                    <button className="text-xs text-blue-600 hover:underline">Size Guide</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 text-sm font-medium border-2 rounded transition-all ${
                          selectedSize === size
                            ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold'
                            : 'border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock + quantity */}
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-sm font-medium px-2.5 py-1 rounded ${product.stock > 0 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {product.stock > 0 ? (product.stock <= 5 ? `Only ${product.stock} left!` : 'In Stock') : 'Out of Stock'}
                </span>
              </div>

              {product.stock > 0 && (
                <div className="flex flex-col gap-3 mb-3">
                  <div className="flex items-center border border-gray-300 rounded overflow-hidden w-fit">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2.5 text-gray-600 hover:bg-gray-100 transition-colors font-bold text-lg"
                    >
                      −
                    </button>
                    <span className="px-4 py-2.5 text-sm font-semibold text-gray-900 border-x border-gray-300 min-w-[40px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-2.5 text-gray-600 hover:bg-gray-100 transition-colors font-bold text-lg"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => void addToCart()}
                      disabled={isAdding || !sizeSelected}
                      className="flex-1 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      {isAdding ? 'Adding…' : 'Add to Cart'}
                    </button>
                    <button
                      onClick={() => {
                        if (!user) { navigate('/login'); return; }
                        if (needsSize && !selectedSize) { setMessage('Please select a size'); return; }
                        void cartService.addItem(product!.id, quantity).then(() => navigate('/cart'));
                      }}
                      disabled={!sizeSelected}
                      className="flex-1 px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              )}

              {message && (
                <p className={`text-sm font-medium ${message.includes('success') || message.includes('Added') ? 'text-green-600' : 'text-red-600'}`}>
                  {message}
                </p>
              )}

              {/* Trust badges */}
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-3 text-center">
                {[
                  { icon: <svg className="w-5 h-5 mx-auto text-orange-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M5 12H3l9-9 9 9h-2v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7z"/><path d="M9 22V12h6v10"/></svg>, label: 'Free Delivery', sub: 'On orders ₹499+' },
                  { icon: <svg className="w-5 h-5 mx-auto text-blue-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>, label: '7-Day Returns', sub: 'Easy returns' },
                  { icon: <svg className="w-5 h-5 mx-auto text-green-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, label: 'Secure Payment', sub: '100% protected' },
                ].map(({ icon, label, sub }) => (
                  <div key={label} className="text-xs text-gray-600">
                    <div className="mb-0.5 flex justify-center">{icon}</div>
                    <div className="font-semibold text-gray-800 text-xs">{label}</div>
                    <div className="text-gray-400 text-xs">{sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Description / Reviews */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
          <div className="flex border-b border-gray-200">
            {(['description', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3.5 text-sm font-semibold capitalize transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'reviews' ? `Reviews${reviews ? ` (${reviews.reviewCount})` : ''}` : 'Description'}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'description' && (
              <p className="text-gray-700 text-sm leading-relaxed">{product.description ?? 'No description available.'}</p>
            )}

            {activeTab === 'reviews' && (
              <div>
                {user && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                    <p className="text-sm font-semibold text-gray-800 mb-3">Write a Review</p>
                    <div className="flex items-center gap-3 mb-3">
                      <StarRating value={myRating} onChange={setMyRating} size="lg" />
                      {myRating > 0 && (
                        <span className="text-sm text-orange-500 font-medium">
                          {['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'][myRating]}
                        </span>
                      )}
                    </div>
                    <textarea
                      value={myComment}
                      onChange={(e) => setMyComment(e.target.value)}
                      placeholder="Share your experience (optional)"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none mb-3"
                    />
                    {reviewError && <p className="text-red-600 text-sm mb-2">{reviewError}</p>}
                    <button
                      onClick={() => void submitReview()}
                      disabled={isSubmitting}
                      className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? 'Submitting…' : 'Submit Review'}
                    </button>
                  </div>
                )}

                {hasReviews ? (
                  <div className="space-y-3">
                    {reviews!.data.map((r) => (
                      <div key={r.id} className="border border-gray-100 rounded-lg px-4 py-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                              {r.user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-gray-900 text-sm">{r.user.name}</span>
                            <StarRating value={r.rating} size="sm" />
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        {r.comment && <p className="text-gray-600 text-sm mt-1 ml-9">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No reviews yet.</p>
                    {!user && (
                      <Link to="/login" className="text-blue-600 hover:underline text-sm font-medium">
                        Log in to write the first review
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-base font-bold text-gray-900 mb-4">Similar Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map((r) => (
                <Link to={`/products/${r.id}`} key={r.id} className="group block no-underline">
                  <div className="border border-gray-100 rounded-lg overflow-hidden hover:shadow-md hover:border-gray-200 transition-all">
                    <div className="bg-gray-50 overflow-hidden" style={{ paddingBottom: '75%', height: 0, position: 'relative' }}>
                      <img
                        src={getProductImage(r)}
                        alt={r.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-2.5">
                      <p className="font-medium text-gray-900 text-xs group-hover:text-orange-600 line-clamp-2 transition-colors leading-tight mb-1">
                        {r.name}
                      </p>
                      {r.reviewCount > 0 && (
                        <div className="flex items-center gap-1 mb-1">
                          <StarRating value={r.averageRating} size="sm" />
                          <span className="text-xs text-gray-400">({r.reviewCount})</span>
                        </div>
                      )}
                      <p className="text-sm font-bold text-gray-900">{formatINR(Number(r.price))}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
