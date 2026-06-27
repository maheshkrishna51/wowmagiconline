import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
  const { signIn, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      window.location.href = '/admin';
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError('Invalid email or password');
      setLoading(false);
    } else {
      window.location.href = '/admin';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 to-amber-700 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-amber-900 rounded-full flex items-center justify-center">
            <Lock size={32} className="text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">Admin Login</h1>
        <p className="text-center text-gray-600 mb-8">Sign in to access the admin panel</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-900 text-white py-3 rounded-lg font-semibold hover:bg-amber-800 transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-amber-900 hover:text-amber-800 font-medium">
            Back to Website
          </a>
        </div>
      </div>
    </div>
  );
}
