import { useEffect, useState } from 'react';
import { orderService } from '../../services/order.service';
import type { PagedReturnRequests } from '../../types/order.types';
import { getProductImage } from '../../utils/productImage';

const statusStyle: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function AdminReturnsPage() {
  const [paged, setPaged] = useState<PagedReturnRequests | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    orderService
      .getReturnRequests(page, 20)
      .then((data) => setPaged(data))
      .finally(() => setLoading(false));
  }, [page]);

  const handleVerify = async (id: number, status: 'approved' | 'rejected') => {
    setVerifying(id);
    try {
      const updated = await orderService.verifyReturnRequest(id, status);
      setPaged((prev) =>
        prev
          ? { ...prev, data: prev.data.map((r) => (r.id === id ? { ...r, ...updated } : r)) }
          : prev,
      );
    } finally {
      setVerifying(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Return Requests</h1>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : !paged?.data.length ? (
        <p className="text-gray-500 text-sm">No return requests yet.</p>
      ) : (
        <>
          <div className="space-y-3">
            {paged.data.map((r) => (
              <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-semibold text-gray-900">Order #{r.orderId}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyle[r.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                {/* Ordered item(s) with Approve/Reject */}
                <div className="space-y-2">
                  {(r.items.length ? r.items : [null]).map((item, i) => (
                    <div
                      key={item ? item.productId : i}
                      className="flex items-center gap-3 border border-gray-100 rounded-lg p-2"
                    >
                      <img
                        src={
                          item?.product
                            ? getProductImage(item.product)
                            : getProductImage({ id: item?.productId ?? r.orderId, price: 0 })
                        }
                        alt={item?.product?.name ?? 'Product'}
                        className="w-14 h-14 rounded-md object-cover border border-gray-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item?.product?.name ?? `Product #${item?.productId ?? '—'}`}
                        </p>
                        {item && <p className="text-xs text-gray-500">Qty: {item.quantity}</p>}
                      </div>

                      {r.status === 'pending' && (
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => void handleVerify(r.id, 'approved')}
                            disabled={verifying === r.id}
                            className="text-xs text-green-700 border border-green-200 hover:bg-green-50 font-medium px-3 py-1.5 rounded-full transition-colors disabled:opacity-60"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => void handleVerify(r.id, 'rejected')}
                            disabled={verifying === r.id}
                            className="text-xs text-red-600 border border-red-200 hover:bg-red-50 font-medium px-3 py-1.5 rounded-full transition-colors disabled:opacity-60"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <p className="text-sm text-gray-600 mt-3">{r.user ? r.user.name : `User #${r.userId}`}</p>
                <p className="text-sm text-gray-900 font-medium mt-1">{r.reason}</p>
                {r.details && <p className="text-sm text-gray-500 mt-1">{r.details}</p>}
              </div>
            ))}
          </div>

          {paged.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
              <span>
                {paged.total} requests · page {paged.page} of {paged.totalPages}
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
