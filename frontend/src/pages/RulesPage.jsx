import { useEffect, useState } from 'react';
import { formatDate } from '../utils/dateUtils';
import api from '../utils/api';
import { BookOpen, Calendar, Trophy, HelpCircle, Star } from 'lucide-react';

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
      setError('Nepodarilo sa načítať pravidlá');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center">
      <div className="text-4xl mb-4">⚠️</div>
      <p className="text-red-500 font-bold">{error}</p>
      <button onClick={fetchRules} className="mt-4 btn btn-outline btn-sm">Skúsiť znova</button>
    </div>
  );

  if (!rules) return <div className="p-8 text-center text-gray-500">Žiadne pravidlá nenájdené</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24">
      {/* Hero Header */}
      <div className="bg-primary pt-12 pb-24 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
            <BookOpen className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-black text-white mb-3 tracking-tight">Pravidlá Hry</h1>
          <p className="text-white/80 font-bold leading-relaxed max-w-sm mx-auto italic text-sm">
            &quot;Vyhráva ten, kto je najviac crazy.&quot;
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-16 relative z-20 space-y-6">
        {/* Time Period */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 text-blue-500 rounded-xl">
              <Calendar size={20} />
            </div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight text-center">Trvanie Turnaja</h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Začiatok</span>
              <span className="font-black text-gray-700">{formatDate(new Date(rules.game_period.start))}</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Koniec</span>
              <span className="font-black text-gray-700">{formatDate(new Date(rules.game_period.end))}</span>
            </div>
          </div>
        </div>

        {/* Scoring */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-xl">
              <Trophy size={20} />
            </div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Bodovací Systém</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Odmena za natagovanie</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { rank: '1. Miesto', points: rules.scoring.rank_1, icon: '🥇' },
                  { rank: '2. Miesto', points: rules.scoring.rank_2, icon: '🥈' },
                  { rank: '3. Miesto', points: rules.scoring.rank_3, icon: '🥉' },
                  { rank: '4. Miesto', points: rules.scoring.rank_4, icon: '4️⃣' },
                  { rank: '5. Miesto', points: rules.scoring.rank_5, icon: '5️⃣' },
                  { rank: 'Iní hráči', points: rules.scoring.rank_6_plus, icon: '👤' },
                ].map((item) => (
                  <div key={item.rank} className="bg-gray-50 p-3 rounded-2xl flex items-center justify-between border border-transparent hover:border-accent/10 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{item.icon}</span>
                      <span className="text-xs font-bold text-gray-500">{item.rank}</span>
                    </div>
                    <span className="text-sm font-black text-accent">+{item.points} b</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-dashed border-gray-100">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Bonusy a penalizácie</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-red-50/50 rounded-2xl">
                  <span className="text-xs font-bold text-red-600/70">Strata za hodinu držania tagu</span>
                  <span className="text-sm font-black text-red-600">-{rules.scoring.time_penalty_per_hour} b</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50/50 rounded-2xl">
                  <span className="text-xs font-bold text-green-600/70">Bonus za deň bez ulovenia</span>
                  <span className="text-sm font-black text-green-600">+{rules.scoring.untagged_day_bonus} b</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Prizes */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Star size={20} />
            </div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Výhry</h2>
          </div>
          <div className="space-y-4">
            <div className="p-5 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-yellow-700">
                <span className="text-lg">🏆</span>
                <span className="text-xs font-black uppercase tracking-widest">Hlavná výhra</span>
              </div>
              <p className="text-lg font-black text-gray-800">{rules.prizes.first_place}</p>
            </div>
            <div className="p-5 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border border-red-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-red-700">
                <span className="text-lg">💣</span>
                <span className="text-xs font-black uppercase tracking-widest">Antivýhra (posledný)</span>
              </div>
              <p className="text-lg font-black text-gray-800">{rules.prizes.last_place}</p>
            </div>
          </div>
        </div>

        {/* How to Play */}
        <div className="bg-primary rounded-[2.5rem] p-8 shadow-xl shadow-primary/20 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-white/10 rounded-xl">
              <HelpCircle size={20} />
            </div>
            <h2 className="text-xl font-black tracking-tight">Ako Hrať?</h2>
          </div>
          <div className="space-y-6">
            {[
              { id: 1, title: 'Kto drží tag', text: 'Iba hráč, ktorý je momentálne &quot;ulovený&quot; (drží tag), môže natagovať ďalšieho.' },
              { id: 2, title: 'Odovzdanie tagu', text: 'Keď niekoho nataguješ (odovzdáš mu tag), on ho preberá a ty si voľný.' },
              { id: 3, title: 'Zber bodov', text: 'Body získavaš podľa aktuálneho poradia hráča, ktorého práve taguješ.' },
              { id: 4, title: 'Časový limit', text: 'Čím dlhšie tag držíš, tým viac bodov strácaš. Rýchlosť je tvoj kamoš.' },
              { id: 5, title: 'Buď v obraze', text: 'Sleduj rebríček a históriu, aby si vedel, kto je práve na rade.' },
            ].map((step) => (
              <div key={step.id} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-black text-sm border border-white/20">
                  {step.id}
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-1">{step.title}</h4>
                  <p className="text-xs text-white/70 leading-relaxed font-medium">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
