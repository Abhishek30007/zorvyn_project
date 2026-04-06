import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { APP_ROLES } from '../utils/roles';

const ROLES = [
  { value: APP_ROLES.USER, label: 'Viewer', description: 'Can view only personal summaries and personal transactions.' },
  { value: APP_ROLES.ANALYST, label: 'Analyst', description: 'Can view global summaries and all transactions in read-only mode.' },
  { value: APP_ROLES.ADMIN, label: 'Admin', description: 'Can manage users and perform full transaction CRUD.' },
];

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(APP_ROLES.USER);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setIsLoading(true);
    try {
      await register(username, password, role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-black" />
          </div>
          <span className="text-white font-bold text-lg">FinDash</span>
        </div>

        <h2 className="text-2xl font-bold text-white mb-1">Create an account</h2>
        <p className="text-zinc-400 text-sm mb-8">Join FinDash to track your finances.</p>

        {error ? (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Username</label>
            <input
              type="text"
              required
              minLength={3}
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 text-white rounded-lg placeholder-zinc-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-sm"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 text-white rounded-lg placeholder-zinc-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-sm"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Role</label>
            <div className="grid grid-cols-1 gap-2">
              {ROLES.map((r) => {
                const isViewer = r.value === APP_ROLES.USER;
                const isSelected = role === r.value;
                const className = isViewer
                  ? `rounded-lg border p-3 text-left transition-all ${
                      isSelected
                        ? 'bg-white border-white text-black shadow-sm'
                        : 'bg-zinc-100 border-zinc-300 text-black hover:border-white'
                    }`
                  : `rounded-lg border p-3 text-left transition-all ${
                      isSelected
                        ? 'bg-black border-white text-white shadow-sm'
                        : 'bg-black border-zinc-700 text-white hover:border-white'
                    }`;

                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={className}
                  >
                    <p className="font-semibold text-sm">{r.label}</p>
                    <p className={`text-xs mt-0.5 ${isViewer ? 'text-zinc-700' : 'text-zinc-400'}`}>
                      {r.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-white hover:bg-zinc-100 text-black rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-8 text-zinc-500 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-white hover:text-zinc-200 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
