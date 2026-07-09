import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productService } from '../services/product.service';
import { wishlistService } from '../services/wishlist.service';
import type { Product, ProductSearchParams } from '../types/product.types';
import { useAuth } from '../context/AuthContext';
import { getProductImage } from '../utils/productImage';
import { formatINR } from '../utils/currency';
import StarRating from '../components/StarRating';
import HeartButton from '../components/HeartButton';

const CATEGORIES = [
  'Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Toys', 'Food', 'Beauty',
  'Pet Supplies', 'Garden', 'Music', 'Baby', 'Office', 'Automotive',
];

const PAGE_SIZE = 20;

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const SORT_OPTIONS = [
  { value: 'createdAt:DESC', label: 'Newest first' },
  { value: 'price:ASC', label: 'Price: Low to High' },
  { value: 'price:DESC', label: 'Price: High to Low' },
  { value: 'name:ASC', label: 'Name: A–Z' },
  { value: 'name:DESC', label: 'Name: Z–A' },
];

export default function ProductsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());

  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [category, setCategory] = useState(searchParams.get('category') ?? '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') ?? 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') ?? 'DESC');
  const [page, setPage] = useState(Number(searchParams.get('page') ?? 1));

  const debouncedQuery = useDebounce(query, 350);
  const hasActiveFilter = !!(debouncedQuery || category);

  useEffect(() => {
    if (!user) { setWishlistIds(new Set()); return; }
    wishlistService.getWishlist().then((p) => setWishlistIds(new Set(p.map((x) => x.id))));
  }, [user]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const sp: Record<string, string | number> = { sortBy, sortOrder, page, limit: PAGE_SIZE };
      if (debouncedQuery) sp.q = debouncedQuery;
      if (category) sp.category = category;
      const data = await productService.searchProducts(sp as ProductSearchParams);
      setProducts(data.data ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, category, sortBy, sortOrder, page]);

  useEffect(() => { setPage(1); }, [debouncedQuery, category, sortBy, sortOrder]);

  useEffect(() => {
    void fetchProducts();
    const p = new URLSearchParams();
    if (debouncedQuery) p.set('q', debouncedQuery);
    if (category) p.set('category', category);
    if (sortBy !== 'createdAt') p.set('sortBy', sortBy);
    if (sortOrder !== 'DESC') p.set('sortOrder', sortOrder);
    if (page > 1) p.set('page', String(page));
    setSearchParams(p, { replace: true });
  }, [debouncedQuery, category, sortBy, sortOrder, page, fetchProducts, setSearchParams]);

  const clearFilters = () => {
    setQuery(''); setCategory('');
    setSortBy('createdAt'); setSortOrder('DESC'); setPage(1);
  };

  const toggleWishlist = async (productId: number, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) return;
    if (wishlistIds.has(productId)) {
      await wishlistService.removeFromWishlist(productId);
      setWishlistIds((prev) => { const n = new Set(prev); n.delete(productId); return n; });
    } else {
      await wishlistService.addToWishlist(productId);
      setWishlistIds((prev) => new Set(prev).add(productId));
    }
  };

  const pageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '…', totalPages];
    if (page >= totalPages - 3) return [1, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '…', page - 1, page, page + 1, '…', totalPages];
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">
                {debouncedQuery ? `Results for "${debouncedQuery}"` : category ? category : 'All Products'}
                {!loading && (
                  <span className="ml-2 text-sm font-normal text-gray-500">({total} products)</span>
                )}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-gray-700"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={`${sortBy}:${sortOrder}`}
                onChange={(e) => { const [sb, so] = e.target.value.split(':'); setSortBy(sb); setSortOrder(so); }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-gray-700"
              >
                {SORT_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              {hasActiveFilter && (
                <button onClick={clearFilters} className="text-xs text-orange-500 font-medium hover:text-orange-600 whitespace-nowrap">
                  Clear all
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Products grid */}
          <div className="flex-1 min-w-0">
            {/* Active filter pills */}
            {hasActiveFilter && (
              <div className="flex flex-wrap gap-2 mb-4">
                {debouncedQuery && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 text-xs rounded-full border border-orange-200 font-medium">
                    "{debouncedQuery}"
                    <button onClick={() => setQuery('')} className="ml-0.5 hover:text-orange-900">×</button>
                  </span>
                )}
                {category && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200 font-medium">
                    {category}
                    <button onClick={() => setCategory('')} className="ml-0.5 hover:text-blue-900">×</button>
                  </span>
                )}
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg overflow-hidden animate-pulse border border-gray-100">
                    <div className="w-full h-44 bg-gray-200" />
                    <div className="p-3">
                      <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-full mb-1" />
                      <div className="h-3 bg-gray-200 rounded w-4/5 mb-3" />
                      <div className="h-5 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
                <p className="text-red-600 mb-3 text-sm">{error}</p>
                <button onClick={() => void fetchProducts()} className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm hover:bg-orange-600 transition-colors">
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && products.length === 0 && (
              <div className="bg-white rounded-lg p-16 text-center border border-gray-200">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <p className="text-lg font-semibold text-gray-700 mb-1">No products found</p>
                <p className="text-sm text-gray-400 mb-4">
                  {debouncedQuery ? `No results for "${debouncedQuery}"` : 'Try adjusting your filters'}
                </p>
                {hasActiveFilter && (
                  <button onClick={clearFilters} className="text-orange-500 text-sm hover:underline font-medium">
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {!loading && !error && products.length > 0 && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {products.map((p) => (
                    <Link to={`/products/${p.id}`} key={p.id} className="group block no-underline">
                      <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-200 flex flex-col h-full">
                        {/* Product image */}
                        <div className="relative overflow-hidden bg-gray-50" style={{ paddingBottom: '75%', height: 0 }}>
                          <img
                            src={getProductImage(p)}
                            alt={p.name}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          {user && (
                            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                              <HeartButton
                                wishlisted={wishlistIds.has(p.id)}
                                onClick={(e) => void toggleWishlist(p.id, e)}
                                size="sm"
                              />
                            </div>
                          )}
                          {p.stock === 0 && (
                            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                              <span className="text-xs font-bold text-red-600 border border-red-300 bg-red-50 px-2 py-1 rounded">Out of Stock</span>
                            </div>
                          )}
                        </div>

                        {/* Card body */}
                        <div className="p-3 flex flex-col flex-1">
                          {p.category && (
                            <span className="text-xs text-blue-600 font-medium mb-1">{p.category}</span>
                          )}
                          <h3 className="text-sm font-medium text-gray-900 leading-tight mb-1 line-clamp-2 flex-1">
                            {p.name}
                          </h3>

                          {p.reviewCount > 0 && (
                            <div className="flex items-center gap-1 mb-1.5">
                              <StarRating value={p.averageRating} size="sm" />
                              <span className="text-xs text-gray-400">({p.reviewCount})</span>
                            </div>
                          )}

                          <div className="mt-auto pt-1">
                            <span className="text-base font-bold text-gray-900">
                              {formatINR(Number(p.price))}
                            </span>
                            {p.stock > 0 && p.stock <= 5 && (
                              <p className="text-xs text-orange-600 font-medium mt-0.5">Only {p.stock} left!</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1 mt-8">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 text-sm border border-gray-300 bg-white rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    {pageNumbers().map((n, i) =>
                      n === '…' ? (
                        <span key={`el-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                      ) : (
                        <button
                          key={n}
                          onClick={() => setPage(Number(n))}
                          className={`min-w-[36px] h-9 text-sm rounded-md border transition-colors ${
                            page === n
                              ? 'bg-orange-500 text-white border-orange-500 font-medium'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {n}
                        </button>
                      ),
                    )}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 text-sm border border-gray-300 bg-white rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
      </div>
    </div>
  );
}
