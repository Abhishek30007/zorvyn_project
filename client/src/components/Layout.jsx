import React, { useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, LogOut, TrendingUp, Shield } from 'lucide-react';
import { APP_ROLES, getRoleLabel, normalizeRole } from '../utils/roles';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const normalizedRole = normalizeRole(user?.role);
  const roleLabel = getRoleLabel(normalizedRole);
  const roleBg =
    normalizedRole === APP_ROLES.ADMIN
      ? 'bg-white text-black'
      : normalizedRole === APP_ROLES.ANALYST
      ? 'bg-zinc-800 text-white'
      : 'bg-zinc-100 text-black';

  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">
      <aside className="w-56 bg-zinc-900 border-r border-zinc-800 flex-col hidden md:flex flex-shrink-0">
        <div className="h-14 flex items-center px-5 border-b border-zinc-800">
          <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center mr-2.5">
            <TrendingUp className="w-4 h-4 text-black" />
          </div>
          <span className="text-white font-bold text-base tracking-tight">FinDash</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                isActive ? 'bg-white text-black' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4 mr-3 flex-shrink-0" />
            Dashboard
          </NavLink>
        </nav>

        <div className="p-3 border-t border-zinc-800">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-zinc-800 mb-2">
            <div className="w-7 h-7 rounded-full bg-zinc-600 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white uppercase">{user?.username?.[0]}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{user?.username}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Shield className="w-3 h-3 text-zinc-400" />
                <span className={`text-xs px-1.5 py-0.5 rounded ${roleBg}`}>{roleLabel}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-black" />
          </div>
          <span className="text-white font-bold text-base">FinDash</span>
        </div>
        <button onClick={handleLogout} className="text-zinc-400 hover:text-white">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto pt-0 md:pt-0 mt-14 md:mt-0 bg-zinc-950">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
