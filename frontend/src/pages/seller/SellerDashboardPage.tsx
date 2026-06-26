import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import StarRating from '../../components/StarRating';

interface Stats {
  totalProducts: number;
  totalReviews: number;
  averageRating: number;
}

export default function SellerDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Stats>('/seller/stats')
      .then(({ data }) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <Link
          to="/seller/products/new"
          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors no-underline"
        >
          + Add Product
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-green-50 text-green-700 rounded-xl p-5">
            <p className="text-sm font-medium opacity-75">My Products</p>
            <p className="text-3xl font-bold mt-1">{stats?.totalProducts ?? 0}</p>
          </div>
          <div className="bg-blue-50 text-blue-700 rounded-xl p-5">
            <p className="text-sm font-medium opacity-75">Total Reviews</p>
            <p className="text-3xl font-bold mt-1">{stats?.totalReviews ?? 0}</p>
          </div>
          <div className="bg-amber-50 text-amber-700 rounded-xl p-5">
            <p className="text-sm font-medium opacity-75">Avg Rating</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-3xl font-bold">
                {stats && stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
              </p>
              {stats && stats.averageRating > 0 && (
                <StarRating value={stats.averageRating} size="sm" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
