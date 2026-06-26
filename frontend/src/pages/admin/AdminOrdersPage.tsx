import { useEffect, useState } from 'react';
import api from '../../api';

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: { name: string };
}

interface OrderRow {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  user: { name: string; email: string };
  items: OrderItem[];
}

interface PagedOrders {
  data: OrderRow[];
  total: number;
  page: number;
  totalPages: number;
}

export default function AdminOrdersPage() {
  const [paged, setPaged] = useState<PagedOrders | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    api
      .get<PagedOrders>(`/admin/orders?page=${page}&limit=20`)
      .then(({ data }) => setPaged(data))
      .finally(() => setLoading(false));
  }, [page]);

  const statusStyle = (s: string) =>
    s === 'confirmed'
      ? 'bg-green-100 text-green-700'
      : s === 'cancelled'
        ? 'bg-red-100 text-red-700'
        : 'bg-gray-100 text-gray-600';

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : (
        <>
          <div className="space-y-3">
            {paged?.data.map((o) => (
              <div
                key={o.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                  className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-900">#{o.id}</span>
                    <span className="text-sm text-gray-600">{o.user.name}</span>
                    <span className="text-xs text-gray-400">{o.user.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">${Number(o.total).toFixed(2)}</span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusStyle(o.status)}`}
                    >
                      {o.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-gray-400 text-sm">{expanded === o.id ? '▲' : '▼'}</span>
                  </div>
                </button>

                {expanded === o.id && (
                  <div className="border-t border-gray-100 divide-y divide-gray-50">
                    {o.items.map((item) => (
                      <div key={item.id} className="flex justify-between px-5 py-2 text-sm">
                        <span className="text-gray-700">
                          {item.product.name}{' '}
                          <span className="text-gray-400">× {item.quantity}</span>
                        </span>
                        <span className="font-medium text-gray-900">
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {paged && paged.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
              <span>
                {paged.total} orders · page {paged.page} of {paged.totalPages}
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
