import { useQuery } from '@tanstack/react-query';
import { gameAPI } from '../utils/api';
import { Trophy, TrendingUp, Clock, Target } from 'lucide-react';
import { formatDuration, intervalToDuration } from 'date-fns';
import clsx from 'clsx';

export default function LeaderboardPage() {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const response = await gameAPI.getLeaderboard();
      return response.data;
    },
    refetchInterval: 15000
  });

  const formatTimeHeld = (duration) => {
    if (!duration) return '0s';
    
    // Parse ISO 8601 duration or timedelta
    const match = duration.match(/(\d+) days?, (\d+):(\d+):(\d+)/);
    if (match) {
      const [, days, hours, minutes] = match;
      return `${days}d ${hours}h ${minutes}m`;
    }
    
    return duration;
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
      <div className="mb-6 text-center">
        <Trophy className="mx-auto text-accent mb-2" size={48} />
        <h1 className="text-3xl font-bold text-primary">Rebríček</h1>
        <p className="text-gray-600">Aktuálne poradie hráčov</p>
      </div>

      <div className="space-y-3">
        {leaderboard?.map((player, index) => (
          <div
            key={player.user.id}
            className={clsx(
              'card card-hover',
              player.is_current_holder && 'bg-highlight/10 border-2 border-highlight'
            )}
          >
            <div className="flex items-center gap-4">
              {/* Rank */}
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                {index === 0 && <span className="text-4xl">🥇</span>}
                {index === 1 && <span className="text-4xl">🥈</span>}
                {index === 2 && <span className="text-4xl">🥉</span>}
                {index > 2 && (
                  <span className="text-2xl font-bold text-gray-400">
                    {player.rank}
                  </span>
                )}
              </div>

              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg truncate">
                    {player.user.full_name}
                  </h3>
                  {player.is_current_holder && (
                    <span className="badge badge-error text-xs animate-pulse">
                      Drží tag
                    </span>
                  )}
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Target size={14} />
                    <span>{player.tags_given} tagov</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp size={14} />
                    <span>{player.tags_received}x chytený</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{formatTimeHeld(player.time_held)}</span>
                  </div>
                </div>
              </div>

              {/* Points */}
              <div className="text-right flex-shrink-0">
                <p className="text-3xl font-bold text-accent">
                  {player.points}
                </p>
                <p className="text-xs text-gray-600">bodov</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(!leaderboard || leaderboard.length === 0) && (
        <div className="text-center py-12">
          <p className="text-gray-600">Žiadni hráči ešte nie sú v rebríčku</p>
        </div>
      )}
    </div>
  );
}
