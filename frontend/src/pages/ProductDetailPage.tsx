import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { getProductImage } from '../utils/productImage';
import StarRating from '../components/StarRating';
import HeartButton from '../components/HeartButton';

interface Product {
  id: number;
  name: string;
  description: string;
  category: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  averageRating: number;
  reviewCount: number;
}

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string };
}

interface ReviewsResponse {
  data: Review[];
  total: number;
  averageRating: number;
  reviewCount: number;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<ReviewsResponse | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [wishlisted, setWishlisted] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProduct(null);
    setRelated([]);
    setReviews(null);
    setWishlisted(false);
    api.get<Product>(`/products/${id}`).then(({ data }) => {
      setProduct(data);
      api.get<Product[]>(`/products/${id}/related`).then((r) => setRelated(r.data ?? []));
    });
    api
      .get<ReviewsResponse>(`/products/${id}/reviews?limit=20`)
      .then(({ data }) => setReviews(data));
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    api.get<number[]>('/wishlist/ids').then(({ data }) => setWishlisted(data.includes(Number(id))));
  }, [user, id]);

  const toggleWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (wishlisted) {
      await api.delete(`/wishlist/${id}`);
      setWishlisted(false);
    } else {
      await api.post(`/wishlist/${id}`);
      setWishlisted(true);
    }
  };

  const addToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setIsAdding(true);
    try {
      await api.post('/cart', { productId: product!.id, quantity });
      setMessage('Added to cart!');
      setTimeout(() => setMessage(''), 2500);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setMessage(msg ?? 'Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const submitReview = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (myRating === 0) {
      setReviewError('Please select a star rating.');
      return;
    }
    setIsSubmitting(true);
    setReviewError('');
    try {
      await api.post(`/products/${id}/reviews`, {
        rating: myRating,
        comment: myComment || undefined,
      });
      setMyRating(0);
      setMyComment('');
      const { data } = await api.get<ReviewsResponse>(`/products/${id}/reviews?limit=20`);
      setReviews(data);
      if (product)
        setProduct({
          ...product,
          averageRating: data.averageRating,
          reviewCount: data.reviewCount,
        });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setReviewError(msg ?? 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product)
    return (
      <div className="flex items-center justify-center min-h-64 text-gray-400 text-sm">
        Loading...
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <Link to="/products" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
        ← Back to Products
      </Link>

      {/* Product card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <img
          src={getProductImage(product)}
          alt={product.name}
          className="w-full h-64 object-cover rounded-lg mb-6 bg-gray-100"
        />

        {product.category && (
          <span className="text-xs font-medium px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full mb-3 inline-block">
            {product.category}
          </span>
        )}

        <div className="flex items-start justify-between gap-3 mb-1">
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          {user && (
            <HeartButton wishlisted={wishlisted} onClick={() => void toggleWishlist()} size="md" />
          )}
        </div>

        {product.reviewCount > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <StarRating value={product.averageRating} size="sm" />
            <span className="text-sm text-gray-500">
              {Number(product.averageRating).toFixed(1)} ({product.reviewCount}{' '}
              {product.reviewCount === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        )}

        <p className="text-gray-600 mb-5">{product.description}</p>

        <div className="flex items-center justify-between mb-6">
          <span className="text-3xl font-bold text-gray-900">
            ${Number(product.price).toFixed(2)}
          </span>
          <span
            className={`text-sm font-medium px-3 py-1 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
          >
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>

        {product.stock > 0 && (
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => void addToCart()}
              disabled={isAdding}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isAdding ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        )}

        {message && (
          <p
            className={`mt-3 text-sm font-medium ${message.includes('Added') ? 'text-green-600' : 'text-red-600'}`}
          >
            {message}
          </p>
        )}
      </div>

      {/* Reviews */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Reviews{reviews && reviews.reviewCount > 0 ? ` (${reviews.reviewCount})` : ''}
        </h2>

        {user && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
            <p className="text-sm font-semibold text-gray-700 mb-3">Write a review</p>
            <div className="flex items-center gap-3 mb-3">
              <StarRating value={myRating} onChange={setMyRating} size="lg" />
              {myRating > 0 && (
                <span className="text-sm text-gray-500">
                  {['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'][myRating]}
                </span>
              )}
            </div>
            <textarea
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              placeholder="Share your thoughts (optional)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
            />
            {reviewError && <p className="text-red-600 text-sm mb-2">{reviewError}</p>}
            <button
              onClick={() => void submitReview()}
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        )}

        {reviews && reviews.data.length > 0 ? (
          <div className="space-y-3">
            {reviews.data.map((r) => (
              <div key={r.id} className="bg-white border border-gray-200 rounded-xl px-5 py-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 text-sm">{r.user.name}</span>
                    <StarRating value={r.rating} size="sm" />
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {r.comment && <p className="text-gray-600 text-sm mt-1">{r.comment}</p>}
              </div>
            ))}
          </div>
        ) : (
          !user && (
            <p className="text-gray-500 text-sm">
              No reviews yet.{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                Log in
              </Link>{' '}
              to be the first!
            </p>
          )
        )}
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((r) => (
              <Link to={`/products/${r.id}`} key={r.id} className="group block no-underline">
                <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-blue-200 transition-all duration-150">
                  <img
                    src={getProductImage(r)}
                    alt={r.name}
                    className="w-full h-20 object-cover rounded-lg mb-3 bg-gray-100"
                    loading="lazy"
                  />
                  <p className="font-medium text-gray-900 text-sm group-hover:text-blue-600 line-clamp-1">
                    {r.name}
                  </p>
                  {r.reviewCount > 0 && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <StarRating value={r.averageRating} size="sm" />
                      <span className="text-xs text-gray-400">({r.reviewCount})</span>
                    </div>
                  )}
                  <p className="text-gray-700 text-sm font-bold mt-1">
                    ${Number(r.price).toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
