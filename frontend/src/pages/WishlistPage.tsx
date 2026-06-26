import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { getProductImage } from '../utils/productImage';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string | null;
  imageUrl: string | null;
  averageRating: number;
  reviewCount: number;
}

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Product[]>('/wishlist')
      .then(({ data }) => setProducts(data))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId: number, e: React.MouseEvent) => {
    e.preventDefault();
    await api.delete(`/wishlist/${productId}`);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-64">
        <p className="text-gray-500 text-sm">Loading wishlist...</p>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Wishlist
        {products.length > 0 && (
          <span className="ml-2 text-gray-400 font-normal text-xl">({products.length})</span>
        )}
      </h1>

      {products.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-4xl mb-4">♡</p>
          <p className="text-lg mb-3">Your wishlist is empty.</p>
          <Link to="/products" className="text-blue-600 hover:underline text-sm">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((product) => (
            <div
              key={product.id}
              className="relative group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => void handleRemove(product.id, e)}
                  aria-label="Remove from wishlist"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow text-red-500 hover:scale-110 transition-transform text-base"
                >
                  ♥
                </button>
              </div>
              <Link to={`/products/${product.id}`} className="no-underline block">
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  className="w-full h-44 object-cover"
                />
                <div className="p-4">
                  {product.category && (
                    <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                      {product.category}
                    </span>
                  )}
                  <h3 className="font-semibold text-gray-900 mt-0.5 line-clamp-2 text-sm leading-snug">
                    {product.name}
                  </h3>
                  <p className="text-gray-500 text-xs mt-1 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-gray-900">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    {product.reviewCount > 0 && (
                      <span className="text-xs text-amber-500">
                        ★ {Number(product.averageRating).toFixed(1)}
                        <span className="text-gray-400 ml-1">({product.reviewCount})</span>
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
