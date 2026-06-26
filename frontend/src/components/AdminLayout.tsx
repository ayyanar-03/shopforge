import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/products', label: 'Products', end: false },
  { to: '/admin/users', label: 'Users', end: false },
  { to: '/admin/orders', label: 'Orders', end: false },
  { to: '/admin/coupons', label: 'Coupons', end: false },
];

export default function AdminLayout() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
      <aside className="w-44 shrink-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Admin</p>
        <nav className="space-y-1">
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
