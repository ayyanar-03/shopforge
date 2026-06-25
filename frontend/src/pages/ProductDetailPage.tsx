import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/products/${id}`).then(({ data }) => setProduct(data));
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
    <div className="flex items-center justify-center min-h-64">
      <div className="text-gray-500 text-sm">Loading...</div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <Link to="/products" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
        ← Back to Products
      </Link>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="w-full h-56 bg-gray-100 rounded-lg mb-6 flex items-center justify-center text-gray-400 text-sm">
          No image
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
        <p className="text-gray-600 mb-4">{product.description}</p>

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
    </div>
  );
}
