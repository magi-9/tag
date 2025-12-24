import { useEffect, useState } from 'react';
import { formatDate } from '../utils/dateUtils';
import api from '../utils/api';

export default function RulesPage() {
  const [rules, setRules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await api.get('/game/settings/rules/');
      setRules(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to load rules:', err);
      setError('Nepodarilo sa nacitat pravidla');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Nacitavanie...</div>;
  if (error) return <div className="p-4 text-error">{error}</div>;
  if (!rules) return <div className="p-4">Ziadne pravidla</div>;

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-4xl font-bold text-accent mb-2">Pravidla Hry</h1>
          <p className="text-lg text-primary">{rules.rules}</p>
        </div>

        {/* Game Period */}
        <div className="card">
          <h2 className="text-2xl font-bold text-primary mb-4">Časové Obdobie</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-primary">Začiatok:</span>
              <span>{formatDate(new Date(rules.game_period.start))}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-primary">Koniec:</span>
              <span>{formatDate(new Date(rules.game_period.end))}</span>
            </div>
          </div>
        </div>

        {/* Scoring System */}
        <div className="card">
          <h2 className="text-2xl font-bold text-primary mb-4">Bodovací Systém</h2>
          
          <div className="space-y-3 mb-6">
            <h3 className="text-xl font-bold text-accent">Body za Natagovanie Hráča</h3>
            <div className="bg-background-hover p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>🥇 1. Miesto:</span>
                <span className="font-bold">{rules.scoring.rank_1} bodov</span>
              </div>
              <div className="flex justify-between">
                <span>🥈 2. Miesto:</span>
                <span className="font-bold">{rules.scoring.rank_2} bodov</span>
              </div>
              <div className="flex justify-between">
                <span>🥉 3. Miesto:</span>
                <span className="font-bold">{rules.scoring.rank_3} bodov</span>
              </div>
              <div className="flex justify-between">
                <span>4. Miesto:</span>
                <span className="font-bold">{rules.scoring.rank_4} bodov</span>
              </div>
              <div className="flex justify-between">
                <span>5. Miesto:</span>
                <span className="font-bold">{rules.scoring.rank_5} bodov</span>
              </div>
              <div className="flex justify-between">
                <span>6.+ Miesto:</span>
                <span className="font-bold">{rules.scoring.rank_6_plus} bodov</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <h3 className="text-xl font-bold text-accent">Penalizácie a Bonusy</h3>
            <div className="bg-background-hover p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>❌ Penalizácia za každú hodinu drážania tagu:</span>
                <span className="font-bold">-{rules.scoring.time_penalty_per_hour} bodov</span>
              </div>
              <div className="flex justify-between">
                <span>✅ Bonus za neutagnutý deň:</span>
                <span className="font-bold">+{rules.scoring.untagged_day_bonus} bodov</span>
              </div>
            </div>
          </div>
        </div>

        {/* Prizes */}
        <div className="card">
          <h2 className="text-2xl font-bold text-primary mb-4">Ceny</h2>
          <div className="space-y-4">
            <div className="bg-accent bg-opacity-10 p-4 rounded-lg border-2 border-accent">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">🏆</span>
                <h3 className="text-xl font-bold text-accent">1. Miesto - Finálna Výhra</h3>
              </div>
              <p className="text-lg font-semibold">{rules.prizes.first_place}</p>
            </div>
            <div className="bg-error bg-opacity-10 p-4 rounded-lg border-2 border-error">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">💣</span>
                <h3 className="text-xl font-bold text-error">Posledné Miesto - Antikvýhra</h3>
              </div>
              <p className="text-lg font-semibold">{rules.prizes.last_place}</p>
            </div>
          </div>
        </div>

        {/* How to Play */}
        <div className="card bg-highlight bg-opacity-10">
          <h2 className="text-2xl font-bold text-highlight mb-4">Ako Hrať?</h2>
          <ol className="space-y-3 list-decimal list-inside">
            <li className="text-lg">
              <strong>Kto drží tag:</strong> Iba hráč, ktorý je momentálne v role "tagu" (drží tag), môže natagovať ďalšieho hráča.
            </li>
            <li className="text-lg">
              <strong>Tagujem:</strong> Keď natagovateš hráča, ten preberá tag a ty sa stávaš hráčom na úteku.
            </li>
            <li className="text-lg">
              <strong>Body:</strong> Získaš body podľa toho, aké miesto na rebríčku mal natagovaný hráč.
            </li>
            <li className="text-lg">
              <strong>Čas:</strong> Čím dlhšie drží tag, tým viac bodov strácaš za čas. Výhodou je, že maš šancu získať viac bodov natagovaním vysoko postaveného hráča.
            </li>
            <li className="text-lg">
              <strong>Sledovanie:</strong> Všetci hráči vidia rebríček, históriu tagov a pravidlá hry.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
