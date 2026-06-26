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
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-6 shadow-sm">
      <Link to="/" className="text-xl font-bold text-blue-600 no-underline">
        ShopForge
      </Link>
      <Link
        to="/products"
        className="text-gray-600 hover:text-blue-600 text-sm font-medium no-underline"
      >
        Products
      </Link>
      {user ? (
        <>
          <Link
            to="/cart"
            className="text-gray-600 hover:text-blue-600 text-sm font-medium no-underline"
          >
            Cart
          </Link>
          <Link
            to="/orders"
            className="text-gray-600 hover:text-blue-600 text-sm font-medium no-underline"
          >
            Orders
          </Link>
          <Link
            to="/wishlist"
            className="text-gray-600 hover:text-red-500 text-sm font-medium no-underline"
          >
            Wishlist
          </Link>
          {user.role === 'seller' && (
            <Link
              to="/seller"
              className="text-gray-600 hover:text-green-600 text-sm font-medium no-underline"
            >
              Seller
            </Link>
          )}
          {user.role === 'admin' && (
            <Link
              to="/admin"
              className="text-gray-600 hover:text-blue-600 text-sm font-medium no-underline"
            >
              Admin
            </Link>
          )}
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-gray-700 font-medium">{user.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm px-3 py-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </>
      ) : (
        <div className="ml-auto flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm text-gray-600 hover:text-blue-600 font-medium no-underline"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="text-sm px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium no-underline"
          >
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
}
