import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import type { User } from '../../types/user.types';
import type { PagedResponse } from '../../types/common.types';

type UserRow = User & { createdAt: string };
type PagedUsers = PagedResponse<UserRow>;

export default function AdminUsersPage() {
  const [paged, setPaged] = useState<PagedUsers | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    adminService
      .getUsers(page, 20)
      .then((data) => setPaged(data as PagedUsers))
      .finally(() => setLoading(false));
  }, [page]);

  const roleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: 'bg-red-100 text-red-700',
      seller: 'bg-amber-100 text-amber-700',
      buyer: 'bg-blue-100 text-blue-700',
    };
    return styles[role] ?? 'bg-gray-100 text-gray-600';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Users</h1>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['ID', 'Name', 'Email', 'Role', 'Joined'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 font-semibold text-gray-600">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paged?.data.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-400">#{u.id}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="px-5 py-3 text-gray-600">{u.email}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${roleBadge(u.role)}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {paged && paged.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
              <span>
                {paged.total} users · page {paged.page} of {paged.totalPages}
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
