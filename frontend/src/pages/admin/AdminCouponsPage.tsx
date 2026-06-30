import { useEffect, useState, type FormEvent } from 'react';
import api from '../../api';

interface Coupon {
  id: number;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
}

interface CouponForm {
  code: string;
  type: 'percentage' | 'fixed';
  value: string;
  minOrderAmount: string;
  maxUses: string;
  expiresAt: string;
}

const EMPTY: CouponForm = {
  code: '',
  type: 'percentage',
  value: '',
  minOrderAmount: '',
  maxUses: '',
  expiresAt: '',
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchCoupons = () => {
    api.get<Coupon[]>('/admin/coupons').then(({ data }) => {
      setCoupons(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await api.post('/admin/coupons', {
        code: form.code,
        type: form.type,
        value: parseFloat(form.value),
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : undefined,
        maxUses: form.maxUses ? parseInt(form.maxUses, 10) : undefined,
        expiresAt: form.expiresAt || undefined,
      });
      setForm(EMPTY);
      setShowForm(false);
      fetchCoupons();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data
        ?.message;
      setFormError(Array.isArray(msg) ? msg[0] : (msg ?? 'Failed to create coupon'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: number) => {
    await api.patch(`/admin/coupons/${id}/toggle`);
    fetchCoupons();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this coupon?')) return;
    await api.delete(`/admin/coupons/${id}`);
    fetchCoupons();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
        <button
          onClick={() => {
            setShowForm((v) => !v);
            setFormError('');
          }}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancel' : '+ New Coupon'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white border border-gray-200 rounded-xl p-5 mb-6 space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Code</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                required
                placeholder="SAVE10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value as 'percentage' | 'fixed' }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Value ({form.type === 'percentage' ? '%' : '$'})
              </label>
              <input
                type="number"
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                required
                min="0.01"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Min order ($)</label>
              <input
                type="number"
                value={form.minOrderAmount}
                onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value }))}
                min="0"
                step="0.01"
                placeholder="—"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Max uses</label>
              <input
                type="number"
                value={form.maxUses}
                onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                min="1"
                step="1"
                placeholder="∞"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Expires at (optional)
            </label>
            <input
              type="datetime-local"
              value={form.expiresAt}
              onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {saving ? 'Creating…' : 'Create Coupon'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : coupons.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">No coupons yet.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Code', 'Discount', 'Min order', 'Uses', 'Expires', 'Status', ''].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-semibold text-gray-900">{c.code}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {c.type === 'percentage' ? `${c.value}%` : `₹${Math.round(Number(c.value) * 83.5).toLocaleString('en-IN')}`} off
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.minOrderAmount ? `₹${Math.round(Number(c.minOrderAmount) * 83.5).toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.usedCount}
                    {c.maxUses ? ` / ${c.maxUses}` : ''}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {c.active ? 'Active' : 'Paused'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => void handleToggle(c.id)}
                        className="text-xs px-2.5 py-1 border border-gray-200 rounded hover:bg-gray-50 text-gray-600 transition-colors"
                      >
                        {c.active ? 'Pause' : 'Activate'}
                      </button>
                      <button
                        onClick={() => void handleDelete(c.id)}
                        className="text-xs px-2.5 py-1 border border-red-200 rounded hover:bg-red-50 text-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
