import { useState, type FormEvent } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/products" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const data = await authService.signup(name, email, password);
      login(data.user, data.accessToken, data.refreshToken);
      navigate('/products');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data
        ?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg ?? 'Signup failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left branding panel */}
      <div className="hidden md:flex w-5/12 bg-[#1C1C1C] flex-col justify-center p-12">
        <div className="flex items-center gap-3 mb-10">
          <svg className="w-10 h-10" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#FF6B00" />
            <path d="M8 10h16M8 16h10M8 22h13" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="23" cy="22" r="3" fill="white" />
          </svg>
          <span className="text-white font-bold text-2xl tracking-tight">ShopForge</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-4 leading-tight">
          Join millions of<br />happy shoppers
        </h1>
        <p className="text-gray-400 text-base mb-8">
          Create your account and start exploring the best deals.
        </p>
        <div className="space-y-4">
          {[
            'Free shipping on orders above ₹499',
            'Exclusive member deals and coupons',
            'Real-time order tracking',
          ].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className="text-gray-300 text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#FF6B00" />
              <path d="M8 10h16M8 16h10M8 22h13" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="23" cy="22" r="3" fill="white" />
            </svg>
            <span className="font-bold text-xl text-gray-900">ShopForge</span>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
            <p className="text-gray-500 text-sm mb-6">Start shopping on ShopForge today</p>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="John Doe"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 disabled:opacity-50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 disabled:opacity-50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={isSubmitting}
                  placeholder="Min. 6 characters"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 disabled:opacity-50 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {isSubmitting ? 'Creating account…' : 'Create Account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-orange-500 font-semibold hover:text-orange-600">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
