import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { notificationsAPI } from '../../utils/api';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminNotifications() {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    notification_type: 'custom'
  });

  const sendMutation = useMutation({
    mutationFn: (data) => notificationsAPI.sendNotification(data),
    onSuccess: () => {
      toast.success('Notifikácia odoslaná!');
      setFormData({ title: '', message: '', notification_type: 'custom' });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Odoslať notifikáciu všetkým</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Titulok
            </label>
            <input
              type="text"
              className="input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Napríklad: Dôležité oznámenie"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Správa
            </label>
            <textarea
              className="input"
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              placeholder="Obsah notifikácie..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Typ notifikácie
            </label>
            <select
              className="input"
              value={formData.notification_type}
              onChange={(e) =>
                setFormData({ ...formData, notification_type: e.target.value })
              }
            >
              <option value="custom">Vlastná</option>
              <option value="game_start">Začiatok hry</option>
              <option value="game_end">Koniec hry</option>
              <option value="announcement">Oznámenie</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={sendMutation.isLoading}
            className="btn btn-primary w-full flex items-center justify-center gap-2"
          >
            {sendMutation.isLoading ? (
              <div className="w-5 h-5 spinner" />
            ) : (
              <>
                <Send size={20} />
                Odoslať všetkým
              </>
            )}
          </button>
        </form>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="font-bold mb-3">Rýchle akcie</h3>
        <div className="space-y-2">
          <button
            onClick={() => {
              setFormData({
                title: 'Hra začala!',
                message: 'Tag Game je aktívna! Choďte tagnúť!',
                notification_type: 'game_start'
              });
            }}
            className="btn btn-outline w-full text-left"
          >
            🎮 Oznámiť začiatok hry
          </button>
          <button
            onClick={() => {
              setFormData({
                title: 'Hra skončila!',
                message: 'Tag Game sa skončila. Pozrite si finálne výsledky!',
                notification_type: 'game_end'
              });
            }}
            className="btn btn-outline w-full text-left"
          >
            🏁 Oznámiť koniec hry
          </button>
        </div>
      </div>
    </div>
  );
}
