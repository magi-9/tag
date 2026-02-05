import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gameAPI, userAPI } from '../utils/api';
import { useAuthStore } from '../stores/authStore';
import { Target, Camera, MapPin, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TagPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState(null);

  const { data: currentHolder } = useQuery({
    queryKey: ['current-holder'],
    queryFn: async () => {
      const response = await gameAPI.getCurrentHolder();
      return response.data;
    }
  });

  const { data: players } = useQuery({
    queryKey: ['approved-users'],
    queryFn: async () => {
      const response = await userAPI.getLeaderboard();
      return response.data;
    }
  });

  const createTagMutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      formData.append('tagged_user_id', data.tagged_user_id);
      if (data.location) formData.append('location', data.location);
      if (data.notes) formData.append('notes', data.notes);
      if (data.photo) formData.append('photo', data.photo);

      const response = await gameAPI.createTag(formData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Tag úspešne vytvorený! 🎯');
      queryClient.invalidateQueries(['current-holder']);
      queryClient.invalidateQueries(['leaderboard']);
      queryClient.invalidateQueries(['recent-tags']);

      // Reset form
      setSelectedUser('');
      setLocation('');
      setNotes('');
      setPhoto(null);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedUser) {
      toast.error('Vyber hráča');
      return;
    }

    createTagMutation.mutate({
      tagged_user_id: parseInt(selectedUser),
      location,
      notes,
      photo
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Fotka je príliš veľká (max 5MB)');
        return;
      }
      setPhoto(file);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 text-center">
        <Target className="mx-auto text-accent mb-2" size={48} />
        <h1 className="text-3xl font-bold text-primary">Tagnúť hráča</h1>
        <p className="text-gray-600">Označ ďalšieho hráča</p>
      </div>

      {/* Current Holder Info */}
      {currentHolder?.user && (
        <div className={`card border-2 mb-6 ${currentHolder.user.id === user?.id
          ? 'bg-accent/10 border-accent'
          : 'bg-error/10 border-error'
          }`}>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Aktuálny držiteľ tagu:</p>
            <p className="text-2xl font-bold text-primary">
              {currentHolder.user.full_name}
            </p>
            {currentHolder.user.id === user?.id ? (
              <p className="text-sm text-accent font-bold mt-1">
                ✓ To si TY! Môžeš tagnúť ďalšieho hráča!
              </p>
            ) : (
              <p className="text-sm text-error font-bold mt-1">
                ⚠️ Nie si držiteľom tagu. Môžeš len sledovať.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tag Form - Only show if user can tag */}
      {currentHolder?.user?.id === user?.id ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vyber hráča na tagnutie *
            </label>
            <select
              className="input"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              required
            >
              <option value="">-- Vyber hráča --</option>
              {players
                ?.filter((p) => p.id !== user.id)
                ?.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.full_name}
                    {currentHolder?.user?.id === player.id && ' (Drží tag)'}
                  </option>
                ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              ⚠️ Môžeš tagnúť iba aktuálneho držiteľa tagu
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin size={16} className="inline mr-1" />
              Miesto (voliteľné)
            </label>
            <input
              type="text"
              className="input"
              placeholder="Kde sa to stalo?"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Poznámka (voliteľná)
            </label>
            <textarea
              className="input"
              rows={3}
              placeholder="Nejaké zaujímavé info..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Camera size={16} className="inline mr-1" />
              Fotka (voliteľná)
            </label>
            <div className="flex gap-2">
              {/* Upload from gallery */}
              <label className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                  id="photo-upload"
                />
                <div className="btn btn-secondary w-full cursor-pointer text-center">
                  📁 Vybrať z galérie
                </div>
              </label>

              {/* Take photo with camera */}
              <label className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoChange}
                  id="photo-camera"
                />
                <div className="btn btn-secondary w-full cursor-pointer text-center">
                  📷 Vyfotiť
                </div>
              </label>
            </div>
            {photo && (
              <div className="mt-2 p-2 bg-green-50 rounded-lg text-sm text-green-700">
                ✓ Fotka: {photo.name} ({(photo.size / 1024).toFixed(1)} KB)
              </div>
            )}
            className="input"
            />
            {photo && (
              <p className="text-sm text-green-600 mt-2">
                ✓ Fotka vybraná: {photo.name}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={createTagMutation.isLoading || !selectedUser}
            className="w-full btn btn-primary flex items-center justify-center gap-2"
          >
            {createTagMutation.isLoading ? (
              <div className="w-5 h-5 spinner" />
            ) : (
              <>
                <Send size={20} />
                Tagnúť!
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="card bg-error/10 border-2 border-error text-center py-8">
          <p className="text-xl font-bold text-error mb-2">⏸️ Nie si držiteľom tagu</p>
          <p className="text-gray-600 mb-4">
            Momentálne môžeš len sledovať rebríček a čakať na svoju šancu.
            Keď ťa niekto tagne, stanete sa držiteľom tagu!
          </p>
          <a href="/rules" className="btn btn-primary inline-block">
            📖 Čítaj Pravidlá
          </a>
        </div>
      )}

      {/* Info Box */}
      <div className="card bg-blue-50 mt-6">
        <h3 className="font-bold text-primary mb-2">ℹ️ Ako to funguje?</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Môžeš tagnúť iba aktuálneho držiteľa tagu</li>
          <li>• Za tagnutie získaš body podľa rankingu hráča</li>
          <li>• Čím dlhšie niekto drží tag, tým viac bodov stráca</li>
          <li>• Fotka je voliteľná, ale odporúčaná pre overenie</li>
        </ul>
      </div>
    </div>
  );
}
