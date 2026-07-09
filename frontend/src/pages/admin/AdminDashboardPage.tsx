import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import type { AdminStats } from '../../types/user.types';
import { formatINR } from '../../utils/currency';
import OrderStatusChart from '../../components/OrderStatusChart';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getStats()
      .then((data) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        { label: 'Total Users', value: stats.totalUsers, color: 'bg-blue-50 text-blue-700' },
        {
          label: 'Total Products',
          value: stats.totalProducts,
          color: 'bg-green-50 text-green-700',
        },
        { label: 'Total Orders', value: stats.totalOrders, color: 'bg-purple-50 text-purple-700' },
        {
          label: 'Total Revenue',
          value: formatINR(stats.totalRevenue),
          color: 'bg-amber-50 text-amber-700',
        },
      ]
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Overview</h1>
      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((c) => (
              <div key={c.label} className={`rounded-xl p-5 ${c.color}`}>
                <p className="text-sm font-medium opacity-75">{c.label}</p>
                <p className="text-3xl font-bold mt-1">{c.value}</p>
              </div>
            ))}
          </div>

          {stats && (
            <div className="mt-6">
              <OrderStatusChart data={stats.ordersByStatus} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
