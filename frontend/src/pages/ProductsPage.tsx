import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productService } from '../services/product.service';
import { wishlistService } from '../services/wishlist.service';
import type { Product, ProductSearchParams } from '../types/product.types';
import { useAuth } from '../context/AuthContext';
import { getProductImage } from '../utils/productImage';
import { formatINR, inrToUsd } from '../utils/currency';
import StarRating from '../components/StarRating';
import HeartButton from '../components/HeartButton';

const CATEGORIES = [
  'Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Toys', 'Food', 'Beauty',
  'Pet Supplies', 'Garden', 'Music', 'Baby', 'Office', 'Automotive',
];

const CATEGORY_EMOJI: Record<string, string> = {
  Electronics: '💻', Clothing: '👗', Books: '📚', Home: '🏠',
  Sports: '⚽', Toys: '🧸', Food: '🍎', Beauty: '💄',
  'Pet Supplies': '🐾', Garden: '🌱', Music: '🎸', Baby: '👶',
  Office: '📎', Automotive: '🚗',
};

const CATEGORY_STYLES: Record<string, string> = {
  Electronics: 'bg-blue-50 text-blue-700 border-blue-200',
  Clothing: 'bg-pink-50 text-pink-700 border-pink-200',
  Books: 'bg-amber-50 text-amber-700 border-amber-200',
  Home: 'bg-teal-50 text-teal-700 border-teal-200',
  Sports: 'bg-green-50 text-green-700 border-green-200',
  Toys: 'bg-purple-50 text-purple-700 border-purple-200',
  Food: 'bg-orange-50 text-orange-700 border-orange-200',
  Beauty: 'bg-rose-50 text-rose-700 border-rose-200',
  'Pet Supplies': 'bg-lime-50 text-lime-700 border-lime-200',
  Garden: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Music: 'bg-violet-50 text-violet-700 border-violet-200',
  Baby: 'bg-sky-50 text-sky-700 border-sky-200',
  Office: 'bg-slate-100 text-slate-700 border-slate-300',
  Automotive: 'bg-gray-100 text-gray-700 border-gray-300',
};

const CATEGORY_GRADIENT: Record<string, string> = {
  Electronics: 'from-blue-400 to-blue-600',
  Clothing: 'from-pink-400 to-pink-600',
  Books: 'from-amber-400 to-amber-600',
  Home: 'from-teal-400 to-teal-600',
  Sports: 'from-green-400 to-green-600',
  Toys: 'from-purple-400 to-purple-600',
  Food: 'from-orange-400 to-orange-600',
  Beauty: 'from-rose-400 to-rose-600',
  'Pet Supplies': 'from-lime-400 to-lime-600',
  Garden: 'from-emerald-400 to-emerald-600',
  Music: 'from-violet-400 to-violet-600',
  Baby: 'from-sky-400 to-sky-600',
  Office: 'from-slate-400 to-slate-600',
  Automotive: 'from-gray-400 to-gray-600',
};

const PAGE_SIZE = 20;

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

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
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') ?? 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') ?? 'DESC');
  const [page, setPage] = useState(Number(searchParams.get('page') ?? 1));

  const debouncedQuery = useDebounce(query, 350);
  const hasActiveFilter = !!(debouncedQuery || category || minPrice || maxPrice);

  useEffect(() => {
    if (!user) {
      setWishlistIds(new Set());
      return;
    }
    wishlistService.getWishlist().then((products) => setWishlistIds(new Set(products.map((p) => p.id))));
  }, [user]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const searchParams: Record<string, string | number> = {
        sortBy,
        sortOrder,
        page,
        limit: PAGE_SIZE,
      };
      if (debouncedQuery) searchParams.q = debouncedQuery;
      if (category) searchParams.category = category;
      if (minPrice) searchParams.minPrice = inrToUsd(Number(minPrice));
      if (maxPrice) searchParams.maxPrice = inrToUsd(Number(maxPrice));

      const data = await productService.searchProducts(searchParams as ProductSearchParams);
      setProducts(data.data ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, category, minPrice, maxPrice, sortBy, sortOrder, page]);

  // Reset to page 1 when any filter changes (not page itself)
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, category, minPrice, maxPrice, sortBy, sortOrder]);

  useEffect(() => {
    void fetchProducts();

    const p = new URLSearchParams();
    if (debouncedQuery) p.set('q', debouncedQuery);
    if (category) p.set('category', category);
    if (minPrice) p.set('minPrice', minPrice);
    if (maxPrice) p.set('maxPrice', maxPrice);
    if (sortBy !== 'createdAt') p.set('sortBy', sortBy);
    if (sortOrder !== 'DESC') p.set('sortOrder', sortOrder);
    if (page > 1) p.set('page', String(page));
    setSearchParams(p, { replace: true });
  }, [debouncedQuery, category, minPrice, maxPrice, sortBy, sortOrder, page, fetchProducts, setSearchParams]);

  const clearFilters = () => {
    setQuery('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('createdAt');
    setSortOrder('DESC');
    setPage(1);
  };

  const toggleWishlist = async (productId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    if (wishlistIds.has(productId)) {
      await wishlistService.removeFromWishlist(productId);
      setWishlistIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
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
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 rounded-2xl px-8 py-10 mb-8 text-white shadow-lg">
        <h1 className="text-3xl font-extrabold mb-1 tracking-tight">Discover Amazing Products</h1>
        <p className="text-indigo-200 text-sm mb-6">100+ curated items across 14 categories</p>
        <div className="relative max-w-xl">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-300 pointer-events-none">🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/20 backdrop-blur border border-white/30 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-200 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filters row */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => setCategory('')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              category === '' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                category === c
                  ? CATEGORY_STYLES[c] + ' ring-2 ring-offset-1 ring-current'
                  : CATEGORY_STYLES[c] + ' hover:opacity-80'
              }`}
            >
              {CATEGORY_EMOJI[c]} {c}
            </button>
          ))}
        </div>

        {/* Price + sort + clear */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-gray-500">₹</span>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min"
              min={0}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-gray-400 text-sm">–</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max"
              min={0}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={`${sortBy}:${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split(':');
              setSortBy(sb);
              setSortOrder(so);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="createdAt:DESC">Newest first</option>
            <option value="price:ASC">Price: low to high</option>
            <option value="price:DESC">Price: high to low</option>
            <option value="name:ASC">Name: A–Z</option>
            <option value="name:DESC">Name: Z–A</option>
          </select>

          {(hasActiveFilter || sortBy !== 'createdAt') && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          {debouncedQuery
            ? `Results for "${debouncedQuery}"`
            : category
              ? category
              : 'All Products'}
          {!loading && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
              {total}
            </span>
          )}
        </h2>
        {!loading && totalPages > 1 && (
          <span className="text-sm text-gray-500">
            page {page} of {totalPages}
          </span>
        )}
      </div>

      {/* Active filter pills */}
      {hasActiveFilter && (
        <div className="flex flex-wrap gap-2 mb-4">
          {debouncedQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full border border-indigo-200">
              Search: {debouncedQuery}
              <button onClick={() => setQuery('')} className="ml-1 hover:text-indigo-900">×</button>
            </span>
          )}
          {category && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full border ${CATEGORY_STYLES[category] ?? 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
              {CATEGORY_EMOJI[category]} {category}
              <button onClick={() => setCategory('')} className="ml-1 opacity-70 hover:opacity-100">×</button>
            </span>
          )}
          {minPrice && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full border border-indigo-200">
              Min ₹{minPrice}
              <button onClick={() => setMinPrice('')} className="ml-1 hover:text-indigo-900">×</button>
            </span>
          )}
          {maxPrice && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full border border-indigo-200">
              Max ₹{maxPrice}
              <button onClick={() => setMaxPrice('')} className="ml-1 hover:text-indigo-900">×</button>
            </span>
          )}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse">
              <div className="h-1 w-full bg-gray-200" />
              <div className="w-full h-48 bg-gray-200" />
              <div className="p-4">
                <div className="h-3 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-5 bg-gray-200 rounded w-4/5 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-full mb-1" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="h-6 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-12">
          <p className="text-red-600 mb-3">{error}</p>
          <button
            onClick={fetchProducts}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg text-sm hover:from-indigo-700 hover:to-violet-700 transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <div className="text-6xl mb-4">😔</div>
          <p className="text-lg font-medium mb-1">No products found</p>
          <p className="text-sm text-gray-400 mb-4">
            {debouncedQuery ? `No results for "${debouncedQuery}"` : 'Try adjusting your filters'}
          </p>
          {hasActiveFilter && (
            <button
              onClick={clearFilters}
              className="text-indigo-600 text-sm hover:underline font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((p) => (
              <Link to={`/products/${p.id}`} key={p.id} className="group block no-underline">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:border-indigo-200 transition-all duration-200 flex flex-col">
                  {/* Colored top-border strip */}
                  <div className={`h-1 w-full bg-gradient-to-r ${p.category && CATEGORY_GRADIENT[p.category] ? CATEGORY_GRADIENT[p.category] : 'from-indigo-400 to-violet-400'}`} />

                  {/* Wishlist button */}
                  <div className="relative">
                    {user && (
                      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <HeartButton
                          wishlisted={wishlistIds.has(p.id)}
                          onClick={(e) => void toggleWishlist(p.id, e)}
                          size="sm"
                        />
                      </div>
                    )}

                    {/* Product image */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                      <img
                        src={getProductImage(p)}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {p.category && (
                        <span className={`absolute bottom-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_STYLES[p.category] ?? 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                          {CATEGORY_EMOJI[p.category]} {p.category}
                        </span>
                      )}
                      {p.stock === 0 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white text-xs font-semibold px-2 py-1 bg-black/60 rounded-full">Out of stock</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1.5 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {p.name}
                    </h3>

                    {p.reviewCount > 0 && (
                      <div className="flex items-center gap-1 mb-1.5">
                        <StarRating value={p.averageRating} size="sm" />
                        <span className="text-xs text-gray-400">({p.reviewCount})</span>
                      </div>
                    )}

                    <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2 flex-1">
                      {p.description ?? 'No description available'}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-lg font-extrabold text-indigo-700">
                        {formatINR(Number(p.price))}
                      </span>
                      {p.stock > 0 && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                          {p.stock > 10 ? 'In stock' : `${p.stock} left`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>

              {pageNumbers().map((n, i) =>
                n === '…' ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(Number(n))}
                    className={`min-w-[36px] h-9 text-sm rounded-lg border transition-colors ${
                      page === n
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-600 font-medium'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-indigo-300'
                    }`}
                  >
                    {n}
                  </button>
                ),
              )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
