import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

interface Product {
  id: number;
  name: string;
  description: string;
  category: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setProduct(null);
    setRelated([]);
    api.get(`/products/${id}`).then(({ data }) => {
      setProduct(data);
      api.get(`/products/${id}/related`).then((r) => setRelated(r.data ?? []));
    });
  }, [id]);

  const addToCart = async () => {
    if (!user) { navigate('/login'); return; }
    setIsAdding(true);
    try {
      await api.post('/cart', { productId: product!.id, quantity });
      setMessage('Added to cart!');
      setTimeout(() => setMessage(''), 2500);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  if (!product) return (
    <div className="flex items-center justify-center min-h-64 text-gray-400 text-sm">
      Loading...
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <Link to="/products" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
        ← Back to Products
      </Link>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <div className="w-full h-56 bg-gray-100 rounded-lg mb-6 flex items-center justify-center text-gray-400 text-sm">
          No image
        </div>

        {product.category && (
          <span className="text-xs font-medium px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full mb-3 inline-block">
            {product.category}
          </span>
        )}

        <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
        <p className="text-gray-600 mb-5">{product.description}</p>

        <div className="flex items-center justify-between mb-6">
          <span className="text-3xl font-bold text-gray-900">${Number(product.price).toFixed(2)}</span>
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
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
              onClick={addToCart}
              disabled={isAdding}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isAdding ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        )}

        {message && (
          <p className={`mt-3 text-sm font-medium ${message.includes('Added') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
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
                  <div className="w-full h-20 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400 text-xs">
                    No image
                  </div>
                  <p className="font-medium text-gray-900 text-sm group-hover:text-blue-600 line-clamp-1">{r.name}</p>
                  <p className="text-gray-700 text-sm font-bold mt-1">${Number(r.price).toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
