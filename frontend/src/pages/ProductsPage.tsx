import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api';

interface Product {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
}

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Toys', 'Food', 'Beauty'];

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [category, setCategory] = useState(searchParams.get('category') ?? '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') ?? 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') ?? 'DESC');

  const debouncedQuery = useDebounce(query, 350);

  const isFiltering = debouncedQuery || category || minPrice || maxPrice;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let data: any;
      if (isFiltering) {
        const params = new URLSearchParams();
        if (debouncedQuery) params.set('q', debouncedQuery);
        if (category) params.set('category', category);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        params.set('sortBy', sortBy);
        params.set('sortOrder', sortOrder);
        const res = await api.get(`/products/search?${params}`);
        data = res.data;
      } else {
        const params = new URLSearchParams({ sortBy, sortOrder });
        const res = await api.get(`/products?${params}`);
        data = res.data;
      }
      setProducts(Array.isArray(data) ? data : data.data ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, category, minPrice, maxPrice, sortBy, sortOrder, isFiltering]);

  useEffect(() => {
    fetchProducts();
    const p = new URLSearchParams();
    if (debouncedQuery) p.set('q', debouncedQuery);
    if (category) p.set('category', category);
    if (minPrice) p.set('minPrice', minPrice);
    if (maxPrice) p.set('maxPrice', maxPrice);
    if (sortBy !== 'createdAt') p.set('sortBy', sortBy);
    if (sortOrder !== 'DESC') p.set('sortOrder', sortOrder);
    setSearchParams(p, { replace: true });
  }, [debouncedQuery, category, minPrice, maxPrice, sortBy, sortOrder]);

  const clearFilters = () => {
    setQuery(''); setCategory(''); setMinPrice(''); setMaxPrice('');
    setSortBy('createdAt'); setSortOrder('DESC');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Search bar */}
      <div className="mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <input
          type="number"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          placeholder="Min price"
          min={0}
          className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="Max price"
          min={0}
          className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={`${sortBy}:${sortOrder}`}
          onChange={(e) => {
            const [sb, so] = e.target.value.split(':');
            setSortBy(sb); setSortOrder(so);
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="createdAt:DESC">Newest first</option>
          <option value="price:ASC">Price: low to high</option>
          <option value="price:DESC">Price: high to low</option>
          <option value="name:ASC">Name: A–Z</option>
          <option value="name:DESC">Name: Z–A</option>
        </select>

        {(isFiltering || sortBy !== 'createdAt') && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {isFiltering ? 'Search Results' : 'Products'}
        </h1>
        {!loading && (
          <span className="text-sm text-gray-500">{total} product{total !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* State: loading */}
      {loading && (
        <div className="flex items-center justify-center min-h-48 text-gray-400 text-sm">
          Loading...
        </div>
      )}

      {/* State: error */}
      {!loading && error && (
        <div className="text-center py-12">
          <p className="text-red-600 mb-3">{error}</p>
          <button onClick={fetchProducts} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            Retry
          </button>
        </div>
      )}

      {/* State: empty */}
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg mb-2">No products found.</p>
          {isFiltering && (
            <button onClick={clearFilters} className="text-blue-600 text-sm hover:underline">
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Product grid */}
      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((p) => (
            <Link to={`/products/${p.id}`} key={p.id} className="group block no-underline">
              <div className="bg-white border border-gray-200 rounded-xl p-5 h-full hover:shadow-md hover:border-blue-200 transition-all duration-150">
                <div className="w-full h-36 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-400 text-xs">
                  No image
                </div>
                {p.category && (
                  <span className="text-xs font-medium px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full mb-2 inline-block">
                    {p.category}
                  </span>
                )}
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {p.name}
                </h3>
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                  {p.description ?? 'No description'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">${Number(p.price).toFixed(2)}</span>
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
