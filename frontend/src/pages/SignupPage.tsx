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
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-600 via-purple-700 to-violet-800 flex-col justify-center items-center text-white p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute bottom-20 right-8 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-white/5" />

        <div className="relative z-10 text-center">
          <div className="text-6xl mb-6">⚡</div>
          <h1 className="text-4xl font-extrabold mb-3 tracking-tight">ShopForge</h1>
          <p className="text-indigo-200 text-lg leading-relaxed max-w-xs">
            Your premium marketplace for everything
          </p>
          <div className="mt-10 flex flex-col gap-3 text-left">
            <div className="flex items-center gap-3 text-indigo-100">
              <span className="text-2xl">🎉</span>
              <span className="text-sm">Join thousands of happy shoppers</span>
            </div>
            <div className="flex items-center gap-3 text-indigo-100">
              <span className="text-2xl">🔒</span>
              <span className="text-sm">Secure & private by design</span>
            </div>
            <div className="flex items-center gap-3 text-indigo-100">
              <span className="text-2xl">💎</span>
              <span className="text-sm">Exclusive deals for members</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Create an account</h2>
            <p className="text-gray-500 text-sm">Start shopping on ShopForge today</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="John Doe"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isSubmitting}
                placeholder="Min. 6 characters"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {isSubmitting ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
