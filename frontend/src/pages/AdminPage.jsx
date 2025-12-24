import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Settings, Users, Trophy, Bell } from 'lucide-react';
import clsx from 'clsx';

// Admin sub-pages
import AdminSettings from '../components/admin/AdminSettings';
import AdminUsers from '../components/admin/AdminUsers';
import AdminNotifications from '../components/admin/AdminNotifications';

export default function AdminPage() {
  const location = useLocation();

  const tabs = [
    { path: '/admin', label: 'Nastavenia', icon: Settings },
    { path: '/admin/users', label: 'Užívatelia', icon: Users },
    { path: '/admin/notifications', label: 'Notifikácie', icon: Bell }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">Admin Panel</h1>
        <p className="text-gray-600">Správa hry a používateľov</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap',
              location.pathname === path
                ? 'bg-accent text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </div>

      {/* Routes */}
      <Routes>
        <Route index element={<AdminSettings />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="notifications" element={<AdminNotifications />} />
      </Routes>
    </div>
  );
}
