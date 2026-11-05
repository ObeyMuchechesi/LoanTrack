import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Wallet, FileText, Boxes, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { withShare } from '../utils/share.js';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/loans', label: 'Loans', icon: Wallet },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/products', label: 'Products', icon: Boxes },
  { to: '/reports', label: 'Reports', icon: FileText },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const nav2 = useNavigate();

  const handleLogout = () => {
    logout();
    nav2(withShare('/login'));
  };

  const items = user?.role === 'admin' ? [...nav, { to: '/users', label: 'Users', icon: Shield }] : nav;

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-5 text-xl font-bold text-brand-600">LoanTrack</div>
        <nav className="flex-1 px-3 space-y-1">
          {items.map(({ to, label, icon: Icon }) => {
            const active = to === '/' ? pathname === '/' : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={withShare(to)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  active ? 'bg-brand-50 text-brand-700 font-medium' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={18} /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t text-sm">
          <div className="font-medium truncate">{user?.name}</div>
          <div className="text-slate-500 capitalize">{user?.role}</div>
          <button onClick={handleLogout} className="mt-3 flex items-center gap-2 text-red-600 text-sm hover:underline">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
