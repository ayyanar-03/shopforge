import { useEffect, useState, type FormEvent } from 'react';
import { productService } from '../../services/product.service';
import type { PagedProducts } from '../../types/product.types';
import { formatINR, inrToUsd } from '../../utils/currency';

const CATEGORIES = [
  'Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Toys', 'Food', 'Beauty',
  'Pet Supplies', 'Garden', 'Music', 'Baby', 'Office', 'Automotive',
];

interface NewProductForm {
  name: string;
  imageUrl: string;
  price: string;
  description: string;
  stock: string;
  category: string;
}

const EMPTY_FORM: NewProductForm = {
  name: '',
  imageUrl: '',
  price: '',
  description: '',
  stock: '',
  category: '',
};

function AddProductModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<NewProductForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set =
    (field: keyof NewProductForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await productService.createProduct({
        name: form.name,
        description: form.description,
        category: form.category || undefined,
        price: inrToUsd(parseFloat(form.price)),
        stock: parseInt(form.stock, 10),
        imageUrl: form.imageUrl || undefined,
      });
      onCreated();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data
        ?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg ?? 'Failed to create product'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Add New Product</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Name</label>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Image Link</label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={set('imageUrl')}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (₹)</label>
            <input
              type="number"
              value={form.price}
              onChange={set('price')}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stock</label>
              <input
                type="number"
                value={form.stock}
                onChange={set('stock')}
                required
                min="0"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={set('category')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              >
                <option value="">None</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Adding…' : 'Add Product'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  const [paged, setPaged] = useState<PagedProducts | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchProducts = (p: number) => {
    setLoading(true);
    productService
      .getProducts({ page: p, limit: 20 })
      .then((data) => setPaged(data))
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
      await productService.deleteProduct(id);
      fetchProducts(page);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          + Add Product
        </button>
      </div>

      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setPage(1);
            fetchProducts(1);
          }}
        />
      )}

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
