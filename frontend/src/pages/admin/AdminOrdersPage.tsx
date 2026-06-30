import { useEffect, useState } from 'react';
import api from '../../api';
import { formatINR } from '../../utils/currency';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;
type OrderStatus = (typeof STATUSES)[number];

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: { name: string };
}

interface OrderRow {
  id: number;
  status: OrderStatus;
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

const statusStyle: Record<OrderStatus, string> = {
  pending: 'bg-gray-100 text-gray-600',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-amber-100 text-amber-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminOrdersPage() {
  const [paged, setPaged] = useState<PagedOrders | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    api
      .get<PagedOrders>(`/admin/orders?page=${page}&limit=20`)
      .then(({ data }) => setPaged(data))
      .finally(() => setLoading(false));
  }, [page]);

  const handleStatusChange = async (orderId: number, status: OrderStatus) => {
    setUpdating(orderId);
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status });
      setPaged((prev) =>
        prev
          ? {
              ...prev,
              data: prev.data.map((o) => (o.id === orderId ? { ...o, status } : o)),
            }
          : prev,
      );
    } finally {
      setUpdating(null);
    }
  };

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
                <div className="flex items-center justify-between px-5 py-3">
                  <button
                    onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                    className="flex items-center gap-4 text-left flex-1 hover:opacity-80"
                  >
                    <span className="font-semibold text-gray-900">#{o.id}</span>
                    <span className="text-sm text-gray-600">{o.user.name}</span>
                    <span className="text-xs text-gray-400">{o.user.email}</span>
                    <span className="font-bold text-gray-900 ml-auto mr-4">
                      {formatINR(Number(o.total))}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </span>
                  </button>

                  <div className="flex items-center gap-3 ml-4">
                    <select
                      value={o.status}
                      disabled={updating === o.id}
                      onChange={(e) => void handleStatusChange(o.id, e.target.value as OrderStatus)}
                      className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400 ${statusStyle[o.status]}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="bg-white text-gray-800 font-normal">
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                      className="text-gray-400 text-sm w-5 text-center"
                    >
                      {expanded === o.id ? '▲' : '▼'}
                    </button>
                  </div>
                </div>

                {expanded === o.id && (
                  <div className="border-t border-gray-100 divide-y divide-gray-50">
                    {o.items.map((item) => (
                      <div key={item.id} className="flex justify-between px-5 py-2 text-sm">
                        <span className="text-gray-700">
                          {item.product.name}{' '}
                          <span className="text-gray-400">× {item.quantity}</span>
                        </span>
                        <span className="font-medium text-gray-900">
                          {formatINR(Number(item.price) * item.quantity)}
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
