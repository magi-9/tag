import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { User, Mail, Phone, LogOut, Bell, Key } from 'lucide-react';
import { subscribeToPush, requestNotificationPermission } from '../utils/pwa';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted'
  );
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || ''
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const success = await updateProfile(formData);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      const subscription = await subscribeToPush();
      if (subscription) {
        try {
          await authAPI.subscribePush(subscription);
          setNotificationsEnabled(true);
          toast.success('Notifikácie povolené! 🔔');
        } catch (error) {
          toast.error('Nepodarilo sa uložiť nastavenia notifikácií');
        }
      }
    } else {
      toast.error('Notifikácie zamietnuté');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 text-center">
        <div className="w-24 h-24 mx-auto bg-accent rounded-full flex items-center justify-center text-white text-4xl mb-4">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.full_name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            user?.full_name?.charAt(0) || user?.username?.charAt(0) || '?'
          )}
        </div>
        <h1 className="text-2xl font-bold text-primary">{user?.full_name || user?.username}</h1>
        <p className="text-gray-600">{user?.email}</p>
        {user?.is_staff && (
          <span className="badge badge-success mt-2">Admin</span>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="card text-center">
          <p className="text-3xl font-bold text-accent">{user?.total_points || 0}</p>
          <p className="text-sm text-gray-600">Celkové body</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-accent">{user?.total_tags_given || 0}</p>
          <p className="text-sm text-gray-600">Tagnutých</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-accent">{user?.total_tags_received || 0}</p>
          <p className="text-sm text-gray-600">Chytený</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-accent">
            {user?.total_time_held ? '⏱️' : '-'}
          </p>
          <p className="text-sm text-gray-600">Čas držania</p>
        </div>
      </div>

      {/* Notifications Toggle */}
      <div className="card mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="text-accent" size={24} />
            <div>
              <h3 className="font-bold">Push notifikácie</h3>
              <p className="text-sm text-gray-600">
                {notificationsEnabled ? 'Povolené' : 'Zakázané'}
              </p>
            </div>
          </div>
          {!notificationsEnabled && (
            <button
              onClick={handleEnableNotifications}
              className="btn btn-primary text-sm"
            >
              Povoliť
            </button>
          )}
          {notificationsEnabled && (
            <span className="text-green-600">✓</span>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Profil</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn btn-outline text-sm"
          >
            {isEditing ? 'Zrušiť' : 'Upraviť'}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Krstné meno
              </label>
              <input
                type="text"
                className="input"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priezvisko
              </label>
              <input
                type="text"
                className="input"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefón
              </label>
              <input
                type="tel"
                className="input"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <button type="submit" className="btn btn-primary w-full">
              Uložiť
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-700">
              <User size={20} />
              <span>{user?.full_name || 'Neuvedené'}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Mail size={20} />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Phone size={20} />
              <span>{user?.phone || 'Neuvedené'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Settings & Logout */}
      <div className="space-y-4 mt-8 pb-10">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Nastavenia účtu</h3>

        <div className="grid gap-3">
          <Link
            to="/profile/change-password"
            className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-accent/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                <Key size={20} />
              </div>
              <span className="font-bold text-gray-700">Zmeniť heslo</span>
            </div>
            <div className="text-gray-300 group-hover:text-accent transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </div>
          </Link>

          <button
            onClick={logout}
            className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-error/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-error/10 rounded-xl flex items-center justify-center text-error group-hover:scale-110 transition-transform">
                <LogOut size={20} />
              </div>
              <span className="font-bold text-gray-700">Odhlásiť sa</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
