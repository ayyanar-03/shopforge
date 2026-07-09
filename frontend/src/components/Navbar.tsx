import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ─── SVG Icons ─────────────────────────────────────────────────────────── */
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);
const CartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" strokeLinejoin="round" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);
const HeartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const PackageIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path d="m16.5 9.4-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.29 7 12 12 20.71 7" /><line x1="12" y1="22" x2="12" y2="12" />
  </svg>
);
const UserIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const XIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
const LogoIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill="#FF6B00" />
    <path d="M8 10h16M8 16h10M8 22h13" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="23" cy="22" r="3" fill="white" />
  </svg>
);

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Toys', 'Food', 'Beauty', 'Pet Supplies', 'Garden', 'Music', 'Baby', 'Office', 'Automotive'];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQ, setSearchQ] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) navigate(`/products?q=${encodeURIComponent(searchQ.trim())}`);
    else navigate('/products');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';
  const isSeller = user?.role === 'seller';

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* Main nav bar */}
      <div className="bg-[#1C1C1C]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline shrink-0">
            <LogoIcon />
            <span className="text-white font-bold text-lg tracking-tight hidden sm:block">ShopForge</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 flex max-w-2xl mx-auto">
            <input
              type="text"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search for products, brands and more…"
              className="flex-1 px-4 py-2.5 text-sm text-gray-900 bg-white border-0 rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button
              type="submit"
              className="px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-r-md flex items-center justify-center transition-colors"
            >
              <SearchIcon />
            </button>
          </form>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {user ? (
              <>
                {/* Profile — direct link */}
                <Link to="/profile" className="flex flex-col items-center text-white hover:text-orange-400 transition-colors px-2 py-1 rounded no-underline">
                  <UserIcon />
                  <span className="text-[10px] mt-0.5 max-w-[70px] truncate">{user.name.split(' ')[0]}</span>
                </Link>

                {/* Cart */}
                <Link to="/cart" className="flex flex-col items-center text-white hover:text-orange-400 transition-colors px-2 py-1 rounded no-underline">
                  <CartIcon />
                  <span className="text-[10px] mt-0.5">Cart</span>
                </Link>

                {/* Orders */}
                <Link to="/orders" className="flex flex-col items-center text-white hover:text-orange-400 transition-colors px-2 py-1 rounded no-underline">
                  <PackageIcon />
                  <span className="text-[10px] mt-0.5">Orders</span>
                </Link>

                {/* Wishlist */}
                <Link to="/wishlist" className="flex flex-col items-center text-white hover:text-orange-400 transition-colors px-2 py-1 rounded no-underline">
                  <HeartIcon />
                  <span className="text-[10px] mt-0.5">Wishlist</span>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-white border border-white/40 rounded-md hover:bg-white/10 no-underline transition-colors">
                  Sign In
                </Link>
                <Link to="/signup" className="px-4 py-2 text-sm font-semibold bg-orange-500 text-white rounded-md hover:bg-orange-600 no-underline transition-colors">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden text-white p-1" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Category strip */}
      <div className="bg-[#232323]">
        <div className="max-w-7xl mx-auto px-4 flex gap-0 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to={`/products?category=${encodeURIComponent(cat)}`}
              className="px-3 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/10 whitespace-nowrap no-underline transition-colors shrink-0"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white shadow-xl border-t border-gray-100">
          <form onSubmit={handleSearch} className="flex px-4 py-3 border-b border-gray-100">
            <input
              type="text"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search products…"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button type="submit" className="px-3 bg-orange-500 text-white rounded-r-md">
              <SearchIcon />
            </button>
          </form>
          <div className="py-2">
            {user ? (
              <>
                <div className="px-4 py-3 bg-gray-50 flex items-center gap-3 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                {[
                  { to: '/profile', label: 'My Profile' },
                  { to: '/orders', label: 'My Orders' },
                  { to: '/cart', label: 'Cart' },
                  { to: '/wishlist', label: 'Wishlist' },
                  ...(isAdmin ? [{ to: '/admin', label: 'Admin Dashboard' }] : []),
                  ...(isSeller ? [{ to: '/seller', label: 'Seller Dashboard' }] : []),
                ].map(({ to, label }) => (
                  <Link key={to} to={to} className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 no-underline border-b border-gray-50">
                    {label}
                  </Link>
                ))}
                <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-red-600 font-medium hover:bg-red-50">
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-3 px-4 py-3">
                <Link to="/login" className="flex-1 py-2.5 text-center text-sm font-semibold border border-gray-300 rounded-md text-gray-700 no-underline hover:bg-gray-50">
                  Sign In
                </Link>
                <Link to="/signup" className="flex-1 py-2.5 text-center text-sm font-semibold bg-orange-500 text-white rounded-md no-underline hover:bg-orange-600">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
