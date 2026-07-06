import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { wishlistService } from '../services/wishlist.service';
import type { Product } from '../types/product.types';
import { getProductImage } from '../utils/productImage';
import { formatINR } from '../utils/currency';
import StarRating from '../components/StarRating';

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <polyline points="3 6 5 6 21 6" />
      <path d="m19 6-.867 12.142A2 2 0 0 1 16.138 20H7.862a2 2 0 0 1-1.995-1.858L5 6m5 0V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wishlistService
      .getWishlist()
      .then((data) => setProducts(data))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId: number) => {
    await wishlistService.removeFromWishlist(productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  if (loading)
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading wishlist…</p>
        </div>
      </div>
    );

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            My Wishlist
            {products.length > 0 && (
              <span className="ml-2 text-base font-normal text-gray-500">({products.length} items)</span>
            )}
          </h1>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-16 text-center">
            <svg className="w-14 h-14 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <p className="text-lg font-semibold text-gray-700 mb-1">Your wishlist is empty</p>
            <p className="text-sm text-gray-500 mb-5">Save items you love by clicking the heart icon on any product.</p>
            <Link to="/products" className="inline-block px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-md hover:bg-orange-600 no-underline transition-colors">
              Explore Products
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">{products.length} item{products.length !== 1 ? 's' : ''} saved</p>
              <Link to="/cart" className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors">
                View Cart →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {products.map((product) => (
                <div key={product.id} className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition-all">
                  <Link to={`/products/${product.id}`} className="no-underline block">
                    <div
                      className="relative overflow-hidden bg-gray-50"
                      style={{ paddingBottom: '75%', position: 'relative', height: 0 }}
                    >
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>
                  <div className="p-3">
                    {product.category && (
                      <span className="text-xs text-blue-600 font-medium">{product.category}</span>
                    )}
                    <Link to={`/products/${product.id}`} className="no-underline">
                      <h3 className="text-sm font-medium text-gray-900 mt-0.5 line-clamp-2 leading-tight hover:text-orange-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    {product.reviewCount > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <StarRating value={product.averageRating} size="sm" />
                        <span className="text-xs text-gray-400">({product.reviewCount})</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-base font-bold text-gray-900">
                        {formatINR(Number(product.price))}
                      </span>
                      <button
                        onClick={() => void handleRemove(product.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Remove from wishlist"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                    <Link
                      to={`/products/${product.id}`}
                      className="mt-2 block text-center py-1.5 border border-orange-400 text-orange-500 text-xs font-semibold rounded hover:bg-orange-50 no-underline transition-colors"
                    >
                      View Product
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
