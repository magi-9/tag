import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { gameAPI } from '../utils/api';
import { Clock, Target, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { sk } from 'date-fns/locale';
import Countdown from '../components/Countdown';

export default function HomePage() {
  const { data: settings } = useQuery({
    queryKey: ['game-settings'],
    queryFn: async () => {
      const response = await gameAPI.getSettings();
      return response.data;
    }
  });

  const { data: currentHolder } = useQuery({
    queryKey: ['current-holder'],
    queryFn: async () => {
      const response = await gameAPI.getCurrentHolder();
      return response.data;
    },
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const response = await gameAPI.getLeaderboard();
      return response.data;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: recentTags } = useQuery({
    queryKey: ['recent-tags'],
    queryFn: async () => {
      const response = await gameAPI.getTags({ page_size: 5 });
      return response.data.results || response.data;
    },
    refetchInterval: 15000
  });

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Game Status */}
      {settings && (
        <div className="card bg-gradient-to-br from-accent to-accent-dark text-white">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Koniec hry</h2>
            <Countdown targetDate={settings.game_end_date} />
            {!settings.is_game_active && (
              <p className="mt-4 text-white/90">Hra momentálne nie je aktívna</p>
            )}
          </div>
        </div>
      )}

      {/* Current Tag Holder */}
      {currentHolder?.user && (
        <div className="card bg-highlight text-white animate-pulse-slow">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
              🎯
            </div>
            <div className="flex-1">
              <p className="text-sm opacity-90">Aktuálny držiteľ tagu</p>
              <h3 className="text-2xl font-bold">{currentHolder.user.full_name}</h3>
              {currentHolder.since && (
                <p className="text-sm opacity-90">
                  {formatDistanceToNow(new Date(currentHolder.since), {
                    addSuffix: true,
                    locale: sk
                  })}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <TrendingUp className="mx-auto mb-2 text-accent" size={32} />
          <p className="text-2xl font-bold">{leaderboard?.[0]?.points || 0}</p>
          <p className="text-xs text-gray-600">Top skóre</p>
        </div>
        <div className="card text-center">
          <Target className="mx-auto mb-2 text-accent" size={32} />
          <p className="text-2xl font-bold">{leaderboard?.length || 0}</p>
          <p className="text-xs text-gray-600">Hráčov</p>
        </div>
        <div className="card text-center">
          <Clock className="mx-auto mb-2 text-accent" size={32} />
          <p className="text-2xl font-bold">{recentTags?.length || 0}</p>
          <p className="text-xs text-gray-600">Tagov dnes</p>
        </div>
      </div>

      {/* Recent Tags */}
      {recentTags && recentTags.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Clock size={20} className="text-accent" />
            Posledné tagy
          </h3>
          <div className="space-y-3">
            {recentTags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-3 bg-background rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {tag.tagger_name} → {tag.tagged_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDistanceToNow(new Date(tag.tagged_at), {
                      addSuffix: true,
                      locale: sk
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-accent font-bold">+{tag.points_awarded}</p>
                  <p className="text-xs text-gray-600">bodov</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top 3 Players */}
      {leaderboard && leaderboard.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-accent" />
            Top 3 hráči
          </h3>
          <div className="space-y-3">
            {leaderboard.slice(0, 3).map((player, index) => (
              <div
                key={player.user.id}
                className="flex items-center gap-4 p-3 bg-background rounded-lg"
              >
                <div className="text-3xl">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </div>
                <div className="flex-1">
                  <p className="font-bold">{player.user.full_name}</p>
                  <p className="text-sm text-gray-600">
                    {player.tags_given} tagov • {player.tags_received}x chytený
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-accent">{player.points}</p>
                  <p className="text-xs text-gray-600">bodov</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
