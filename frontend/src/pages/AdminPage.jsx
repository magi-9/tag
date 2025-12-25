import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Settings, Users, Bell, Key, Gamepad2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import clsx from 'clsx';
import { Routes, Route } from 'react-router-dom';

// Admin sub-pages
import AdminSettings from '../components/admin/AdminSettings';
import AdminUsers from '../components/admin/AdminUsers';
import AdminNotifications from '../components/admin/AdminNotifications';

export default function AdminPage() {
  const location = useLocation();
  const { user, updateProfile } = useAuthStore();

  const handleToggleParticipation = async () => {
    await updateProfile({ is_participating: !user.is_participating });
  };

  const tabs = [
    { path: '/admin', label: 'Nastavenia', icon: Settings },
    { path: '/admin/users', label: 'Užívatelia', icon: Users },
    { path: '/admin/notifications', label: 'Notifikácie', icon: Bell }
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl mb-20">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Admin Panel</h1>
            <p className="text-xs text-gray-500 font-medium italic">Správa hry v reálnom čase</p>
          </div>
          <Link
            to="/profile/change-password"
            className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-accent hover:border-accent/20 transition-all shadow-sm"
            title="Zmeniť heslo"
          >
            <Key size={20} />
          </Link>
        </div>

        <button
          onClick={handleToggleParticipation}
          className={clsx(
            "flex items-center justify-center gap-2 px-4 py-3 border rounded-2xl text-sm font-black transition-all shadow-sm w-full",
            user?.is_participating
              ? "bg-success/5 border-success/20 text-success"
              : "bg-gray-50 border-gray-100 text-gray-400"
          )}
        >
          <Gamepad2 size={18} />
          {user?.is_participating ? 'ZAPOJENÝ V HRE' : 'MIMO HRY (REŽIM SPRÁVCU)'}
        </button>
      </div>

      {/* Modern Tabs - Compact for Mobile */}
      <div className="flex bg-gray-100/50 p-1 rounded-2xl border border-gray-100 mb-8 items-center">
        {tabs.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={clsx(
                'flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-2 py-3 rounded-xl font-bold transition-all duration-300 flex-1',
                isActive
                  ? 'bg-white text-accent shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Icon size={18} />
              <span className="text-[10px] md:text-xs uppercase tracking-tighter">{label}</span>
            </Link>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="animate-fade-in">
        <Routes>
          <Route index element={<AdminSettings />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="notifications" element={<AdminNotifications />} />
        </Routes>
      </div>
    </div>
  );
}
