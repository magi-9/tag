import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gameAPI, userAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['game-settings'],
    queryFn: async () => {
      const response = await gameAPI.getSettings();
      return response.data;
    }
  });

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await userAPI.getUsers();
      return response.data;
    }
  });

  const [formData, setFormData] = useState(settings || {});

  const updateMutation = useMutation({
    mutationFn: (data) => gameAPI.updateSettings(settings.id, data),
    onSuccess: () => {
      toast.success('Nastavenia uložené!');
      queryClient.invalidateQueries(['game-settings']);
      setIsEditing(false);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="w-12 h-12 spinner mx-auto" />;
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Nastavenia hry</h2>
          <button
            onClick={() => {
              setIsEditing(!isEditing);
              setFormData(settings);
            }}
            className="btn btn-outline text-sm"
          >
            {isEditing ? 'Zrušiť' : 'Upraviť'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Game Period */}
          <div className="border-b pb-4">
            <h3 className="font-bold mb-3">Trvanie hry</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Začiatok hry
                </label>
                <input
                  type="datetime-local"
                  className="input"
                  value={formData.game_start_date?.slice(0, 16)}
                  onChange={(e) =>
                    setFormData({ ...formData, game_start_date: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Koniec hry
                </label>
                <input
                  type="datetime-local"
                  className="input"
                  value={formData.game_end_date?.slice(0, 16)}
                  onChange={(e) =>
                    setFormData({ ...formData, game_end_date: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* Scoring Rules */}
          <div className="border-b pb-4">
            <h3 className="font-bold mb-3">Bodovanie za tagnutie</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5].map((rank) => (
                <div key={rank}>
                  <label className="block text-sm font-medium mb-2">
                    {rank}. miesto
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={formData[`tag_points_rank_${rank}`]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [`tag_points_rank_${rank}`]: parseInt(e.target.value)
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium mb-2">
                  6+ miesto
                </label>
                <input
                  type="number"
                  className="input"
                  value={formData.tag_points_rank_other}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tag_points_rank_other: parseInt(e.target.value)
                    })
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* Current Tag Holder */}
          <div className="border-b pb-4 bg-primary/10 p-4 rounded">
            <h3 className="font-bold mb-3">👑 Aktuálny držiteľ tagu</h3>
            <div>
              <label className="block text-sm font-medium mb-2">
                Kto začína s tagom?
              </label>
              <select
                className="input"
                value={formData.current_tag_holder || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    current_tag_holder: e.target.value ? parseInt(e.target.value) : null
                  })
                }
                disabled={!isEditing}
              >
                <option value="">-- Žiadny (random prvý tagger) --</option>
                {usersData?.results?.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name || user.username}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-600 mt-2">
                {formData.current_tag_holder && usersData?.results?.find(u => u.id === formData.current_tag_holder)
                  ? `Vybraný: ${usersData.results.find(u => u.id === formData.current_tag_holder).full_name || usersData.results.find(u => u.id === formData.current_tag_holder).username}`
                  : 'Nikto nie je vybraný'}
              </p>
            </div>
          </div>

          {/* Penalties & Bonuses */}
          <div className="border-b pb-4">
            <h3 className="font-bold mb-3">Penalizácie a bonusy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Penalizácia za hodinu držania
                </label>
                <input
                  type="number"
                  className="input"
                  value={formData.time_penalty_per_hour}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      time_penalty_per_hour: parseInt(e.target.value)
                    })
                  }
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Bonus za netagnutý deň
                </label>
                <input
                  type="number"
                  className="input"
                  value={formData.bonus_untagged_day}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bonus_untagged_day: parseInt(e.target.value)
                    })
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* Prizes */}
          <div className="border-b pb-4">
            <h3 className="font-bold mb-3">Ceny</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Hlavná výhra (1. miesto)
                </label>
                <textarea
                  className="input"
                  rows={2}
                  value={formData.first_place_prize}
                  onChange={(e) =>
                    setFormData({ ...formData, first_place_prize: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Antikvýhra (posledné miesto)
                </label>
                <textarea
                  className="input"
                  rows={2}
                  value={formData.last_place_prize}
                  onChange={(e) =>
                    setFormData({ ...formData, last_place_prize: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h3 className="font-bold mb-3">Notifikácie</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="enable_notifications"
                  checked={formData.enable_notifications}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      enable_notifications: e.target.checked
                    })
                  }
                  disabled={!isEditing}
                  className="w-5 h-5"
                />
                <label htmlFor="enable_notifications" className="font-medium">
                  Povoliť notifikácie
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Titulok notifikácie
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.notification_title}
                  onChange={(e) =>
                    setFormData({ ...formData, notification_title: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Šablóna správy (použij {'{tagger}'} a {'{tagged}'})
                </label>
                <textarea
                  className="input"
                  rows={2}
                  value={formData.notification_message_template}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notification_message_template: e.target.value
                    })
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <button
              type="submit"
              disabled={updateMutation.isLoading}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              {updateMutation.isLoading ? (
                <div className="w-5 h-5 spinner" />
              ) : (
                <>
                  <Save size={20} />
                  Uložiť zmeny
                </>
              )}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
