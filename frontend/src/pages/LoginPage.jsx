import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LogIn, Eye } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, enterSpectatorMode, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(formData);
    if (success) {
      navigate('/');
    }
  };

  const handleSpectator = () => {
    enterSpectatorMode();
    navigate('/leaderboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-accent p-4">
      <div className="card max-w-md w-full bg-white/95 backdrop-blur shadow-2xl border-0 overflow-hidden">
        <div className="text-center p-8 bg-primary/5 border-b border-gray-100">
          <div className="text-6xl mb-4 drop-shadow-lg">🏃</div>
          <h1 className="text-4xl font-black text-primary mb-1 tracking-tight">Tag Game</h1>
          <p className="text-gray-500 font-medium">Oficiálna hra o titul najrýchlejšieho</p>
        </div>

        <div className="p-8 space-y-6">
          <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Používateľské meno
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                className="input bg-gray-50 border-gray-100 focus:bg-white transition-all py-4"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Heslo
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="input bg-gray-50 border-gray-100 focus:bg-white transition-all py-4"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary py-4 shadow-lg shadow-accent/20 flex items-center justify-center gap-2 text-lg"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={20} />
                  Prihlásiť sa
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500 font-bold">alebo</span></div>
          </div>

          <button
            onClick={handleSpectator}
            className="w-full py-4 border-2 border-primary/10 text-primary font-bold rounded-xl hover:bg-primary/5 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Eye size={20} />
            Vstúpiť ako divák
          </button>

          <div className="pt-2 text-center">
            <p className="text-gray-500 font-medium">
              Ešte nemáš účet?{' '}
              <Link to="/register" className="text-accent font-bold hover:underline">
                Zaregistruj sa
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
