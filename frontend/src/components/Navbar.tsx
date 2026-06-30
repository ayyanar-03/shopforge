import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-900 via-purple-900 to-violet-900 px-6 py-0 flex items-center shadow-lg sticky top-0 z-50 h-14">
      <Link to="/" className="text-white font-extrabold text-xl tracking-tight no-underline mr-6">
        ⚡ ShopForge
      </Link>
      <Link
        to="/products"
        className="text-indigo-200 hover:text-white text-sm font-medium no-underline transition-colors"
      >
        Products
      </Link>
      {user ? (
        <>
          <Link
            to="/cart"
            className="text-indigo-200 hover:text-white text-sm font-medium no-underline transition-colors ml-5"
          >
            🛒 Cart
          </Link>
          <Link
            to="/orders"
            className="text-indigo-200 hover:text-white text-sm font-medium no-underline transition-colors ml-5"
          >
            📦 Orders
          </Link>
          <Link
            to="/wishlist"
            className="text-indigo-200 hover:text-white text-sm font-medium no-underline transition-colors ml-5"
          >
            ♡ Wishlist
          </Link>
          {user.role === 'seller' && (
            <Link
              to="/seller"
              className="ml-5 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold no-underline hover:bg-emerald-600 transition-colors"
            >
              Seller
            </Link>
          )}
          {user.role === 'admin' && (
            <Link
              to="/admin"
              className="ml-5 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold no-underline hover:bg-amber-600 transition-colors"
            >
              Admin
            </Link>
          )}
          <div className="ml-auto flex items-center gap-4">
            <Link
              to="/profile"
              className="text-sm text-white font-medium hover:text-indigo-200 no-underline transition-colors"
            >
              {user.name}
            </Link>
            <button
              onClick={handleLogout}
              className="border border-white/30 text-white/80 hover:bg-white/10 rounded-full px-3 py-1.5 text-sm cursor-pointer transition-colors"
            >
              Logout
            </button>
          </div>
        </>
      ) : (
        <div className="ml-auto flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm text-white/80 hover:text-white font-medium no-underline border border-white/30 rounded-full px-4 py-1.5 hover:bg-white/10 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="text-sm px-4 py-1.5 bg-white text-indigo-700 font-semibold rounded-full hover:bg-indigo-50 no-underline transition-colors"
          >
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
}
