import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isSpectator, user } = useAuthStore();

  if (!isAuthenticated && !isSpectator) {
    return <Navigate to="/login" />;
  }

  // Spectators skip approval check
  if (isSpectator) {
    return children;
  }

  // Check if user is approved
  if (!user?.is_approved && !user?.is_staff) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="card max-w-md w-full text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold mb-2">Čaká sa na schválenie</h1>
          <p className="text-gray-600 mb-4">
            Tvoja registrácia čaká na schválenie administrátorom.
            Dostaneš notifikáciu keď ťa admin schváli a budeš môcť začať hrať.
          </p>
          <button
            onClick={() => useAuthStore.getState().logout()}
            className="btn btn-outline"
          >
            Odhlásiť sa
          </button>
        </div>
      </div>
    );
  }

  return children;
}
