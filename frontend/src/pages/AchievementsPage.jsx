import { useQuery } from '@tanstack/react-query';
import { gameAPI } from '../utils/api';
import { Award, Trophy, Zap, Clock, Target } from 'lucide-react';

const ACHIEVEMENT_ICONS = {
  worst_player: '💩',
  fastest_player: '⚡',
  slowest_player: '🐌',
  fastest_catch: '🚀',
  slowest_catch: '⏰',
  most_tags_given: '🏹',
  most_tags_received: '🎯',
  custom: '🏆'
};

export default function AchievementsPage() {
  const { data: achievements, isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const response = await gameAPI.getAchievements();
      return response.data;
    }
  });

  // Normalize API shape (paginated vs array) to always render safely
  const achievementList = Array.isArray(achievements?.results)
    ? achievements.results
    : Array.isArray(achievements)
      ? achievements
      : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 spinner" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 text-center">
        <Award className="mx-auto text-accent mb-2" size={48} />
        <h1 className="text-3xl font-bold text-primary">Úspechy</h1>
        <p className="text-gray-600">Špeciálne ocenenia hráčov</p>
      </div>

      <div className="space-y-4">
        {achievementList.map((achievement) => (
          <div
            key={achievement.id}
            className="card card-hover bg-gradient-to-r from-accent/10 to-transparent"
          >
            <div className="flex items-center gap-4">
              <div className="text-5xl flex-shrink-0">
                {ACHIEVEMENT_ICONS[achievement.achievement_type] || achievement.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-primary truncate">
                  {achievement.title}
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  {achievement.description}
                </p>
                {achievement.value && (
                  <p className="text-accent font-bold">
                    {achievement.value}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {achievement.user_name}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {achievementList.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">Žiadne úspechy zatiaľ neboli udelené</p>
        </div>
      )}

      {/* Info about achievements */}
      <div className="card bg-blue-50 mt-6">
        <h3 className="font-bold text-primary mb-3">📊 Typy úspechov</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li>⚡ <strong>Fastest Player</strong> - Najmenej času držal tag</li>
          <li>🐌 <strong>Slowest Player</strong> - Najviac času držal tag</li>
          <li>🚀 <strong>Fastest Catch</strong> - Najrýchlejšie tagnutie</li>
          <li>🏹 <strong>Most Active Tagger</strong> - Najviac tagov</li>
          <li>🎯 <strong>Most Caught</strong> - Najviackrát chytený</li>
          <li>💩 <strong>Worst Player</strong> - Najmenej bodov (anti-cena)</li>
        </ul>
      </div>
    </div>
  );
}
