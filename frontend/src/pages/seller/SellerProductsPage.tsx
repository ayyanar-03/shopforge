import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import StarRating from '../../components/StarRating';

interface Product {
  id: number;
  name: string;
  category: string | null;
  price: number;
  stock: number;
  averageRating: number;
  reviewCount: number;
}

interface PagedProducts {
  data: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export default function SellerProductsPage() {
  const [paged, setPaged] = useState<PagedProducts | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchProducts = (p: number) => {
    setLoading(true);
    api
      .get<PagedProducts>(`/seller/products?page=${p}&limit=20`)
      .then(({ data }) => setPaged(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts(page);
  }, [page]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await api.delete(`/products/${id}`);
      fetchProducts(page);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
        <Link
          to="/seller/products/new"
          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors no-underline"
        >
          + Add Product
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : paged?.data.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="mb-3">You have no products yet.</p>
          <Link to="/seller/products/new" className="text-green-600 hover:underline text-sm">
            List your first product →
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Name', 'Category', 'Price', 'Stock', 'Rating', ''].map((h) => (
                    <th key={h} className="text-left px-5 py-3 font-semibold text-gray-600">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paged?.data.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{p.name}</td>
                    <td className="px-5 py-3 text-gray-500">{p.category ?? '—'}</td>
                    <td className="px-5 py-3 text-gray-700">${Number(p.price).toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`font-medium ${p.stock > 0 ? 'text-green-700' : 'text-red-600'}`}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {p.reviewCount > 0 ? (
                        <div className="flex items-center gap-1">
                          <StarRating value={p.averageRating} size="sm" />
                          <span className="text-xs text-gray-400">({p.reviewCount})</span>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">No reviews</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/seller/products/${p.id}/edit`}
                          className="text-xs px-3 py-1 text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition-colors no-underline"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => void handleDelete(p.id)}
                          disabled={deleting === p.id}
                          className="text-xs px-3 py-1 text-red-600 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50 transition-colors"
                        >
                          {deleting === p.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {paged && paged.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
              <span>
                {paged.total} products · page {paged.page} of {paged.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === paged.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
