import { useAuthStore } from '../stores/authStore';
import { Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { notificationsAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const response = await notificationsAPI.getUnreadCount();
      return response.data.count;
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  return (
    <header className="bg-primary text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Tag Game</h1>
          <p className="text-sm text-gray-300">
            {user?.full_name || user?.username}
          </p>
        </div>
        
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 hover:bg-primary-light rounded-lg transition-colors"
        >
          <Bell size={24} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-highlight text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
