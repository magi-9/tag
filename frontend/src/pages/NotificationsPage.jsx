import { useQuery } from '@tanstack/react-query';
import { notificationsAPI } from '../utils/api';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { sk } from 'date-fns/locale';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await notificationsAPI.getNotifications();
      return response.data.results || response.data;
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => notificationsAPI.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['notifications', 'unread-count']);
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsAPI.markAllAsRead(),
    onSuccess: () => {
      toast.success('Všetky notifikácie označené ako prečítané');
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['notifications', 'unread-count']);
    }
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'tag':
        return '🎯';
      case 'approval':
        return '✅';
      case 'game_start':
        return '🎮';
      case 'game_end':
        return '🏁';
      case 'achievement':
        return '🏆';
      default:
        return '📢';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 spinner" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Bell size={28} />
            Notifikácie
          </h1>
          <p className="text-gray-600 text-sm">
            {notifications?.filter(n => !n.read_at).length || 0} neprečítaných
          </p>
        </div>
        {notifications?.some(n => !n.read_at) && (
          <button
            onClick={() => markAllAsReadMutation.mutate()}
            className="btn btn-outline text-sm flex items-center gap-2"
            disabled={markAllAsReadMutation.isLoading}
          >
            <CheckCheck size={16} />
            Označiť všetky
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications?.map((notification) => (
          <div
            key={notification.id}
            className={`card cursor-pointer transition-all ${
              !notification.read_at
                ? 'bg-accent/10 border-l-4 border-accent'
                : 'bg-white'
            }`}
            onClick={() => {
              if (!notification.read_at) {
                markAsReadMutation.mutate(notification.id);
              }
            }}
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl flex-shrink-0">
                {getNotificationIcon(notification.notification_type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-primary">
                    {notification.title}
                  </h3>
                  {!notification.read_at && (
                    <span className="badge badge-error text-xs">Nová</span>
                  )}
                </div>
                <p className="text-gray-700 mb-2">{notification.message}</p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(notification.sent_at), {
                    addSuffix: true,
                    locale: sk
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(!notifications || notifications.length === 0) && (
        <div className="text-center py-12">
          <Bell className="mx-auto text-gray-400 mb-4" size={64} />
          <p className="text-gray-600">Žiadne notifikácie</p>
        </div>
      )}
    </div>
  );
}
