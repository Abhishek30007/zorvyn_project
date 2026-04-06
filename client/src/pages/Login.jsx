import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-zinc-950 border-r border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-black" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">FinDash</span>
        </div>
        <div>
          <blockquote className="text-zinc-300 text-3xl font-light leading-relaxed mb-6">
            "Track every penny.<br />Master your finances."
          </blockquote>
          <div className="flex gap-6">
            {['Total Control', 'Role-Based Access', 'Real-Time Insights'].map((f) => (
              <div key={f} className="text-xs text-zinc-500 uppercase tracking-wider border-l border-zinc-700 pl-3">{f}</div>
            ))}
          </div>
        </div>
        <p className="text-zinc-600 text-sm">© 2026 FinDash. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-zinc-900">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-black" />
            </div>
            <span className="text-white font-bold text-lg">FinDash</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Sign in</h2>
          <p className="text-zinc-400 text-sm mb-8">Enter your credentials to access the dashboard.</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Username</label>
              <input
                type="text"
                required
                autoComplete="username"
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 text-white rounded-lg placeholder-zinc-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-sm"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 pr-10 bg-zinc-800 border border-zinc-700 text-white rounded-lg placeholder-zinc-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-white hover:bg-zinc-100 text-black rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-8 text-zinc-500 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-white hover:text-zinc-200 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
