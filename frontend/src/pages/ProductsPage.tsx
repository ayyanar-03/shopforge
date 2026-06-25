import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/products')
      .then(({ data }) => {
        setProducts(Array.isArray(data) ? data : data.data ?? []);
      })
      .catch(() => setError('Failed to load products. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-gray-500 text-sm">Loading products...</div>
    </div>
  );

  if (error) return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-center">
      <p className="text-red-600 mb-4">{error}</p>
      <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
        Retry
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Products</h1>

      {products.length === 0 ? (
        <p className="text-gray-500">No products available yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((p) => (
            <Link
              to={`/products/${p.id}`}
              key={p.id}
              className="group block no-underline"
            >
              <div className="bg-white border border-gray-200 rounded-xl p-5 h-full hover:shadow-md hover:border-blue-200 transition-all duration-150">
                <div className="w-full h-36 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-400 text-sm">
                  No image
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {p.name}
                </h3>
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                  {p.description ?? 'No description'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    ${Number(p.price).toFixed(2)}
                  </span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
