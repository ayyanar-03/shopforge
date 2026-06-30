import { useEffect, useState } from 'react';
import api from '../../api';
import { formatINR } from '../../utils/currency';

interface Product {
  id: number;
  name: string;
  category: string | null;
  price: number;
  stock: number;
}

interface PagedProducts {
  data: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export default function AdminProductsPage() {
  const [paged, setPaged] = useState<PagedProducts | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchProducts = (p: number) => {
    setLoading(true);
    api
      .get<PagedProducts>(`/products?page=${p}&limit=20`)
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Products</h1>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['ID', 'Name', 'Category', 'Price', 'Stock', ''].map((h) => (
                    <th key={h} className="text-left px-5 py-3 font-semibold text-gray-600">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paged?.data.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-400">#{p.id}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">{p.name}</td>
                    <td className="px-5 py-3 text-gray-500">{p.category ?? '—'}</td>
                    <td className="px-5 py-3 text-gray-700">{formatINR(Number(p.price))}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`font-medium ${p.stock > 0 ? 'text-green-700' : 'text-red-600'}`}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => void handleDelete(p.id)}
                        disabled={deleting === p.id}
                        className="text-xs px-3 py-1 text-red-600 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        {deleting === p.id ? 'Deleting…' : 'Delete'}
                      </button>
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
