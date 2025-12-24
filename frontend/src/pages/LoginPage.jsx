import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-accent p-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏃</div>
          <h1 className="text-3xl font-bold text-primary mb-2">Tag Game</h1>
          <p className="text-gray-600">Prihlás sa a začni hrať</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Používateľské meno
            </label>
            <input
              type="text"
              className="input"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heslo
            </label>
            <input
              type="password"
              className="input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn btn-primary flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 spinner" />
            ) : (
              <>
                <LogIn size={20} />
                Prihlásiť sa
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Ešte nemáš účet?{' '}
            <Link to="/register" className="text-accent font-medium hover:underline">
              Zaregistruj sa
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
