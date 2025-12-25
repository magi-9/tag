import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import LeaderboardPage from './pages/LeaderboardPage';
import TagPage from './pages/TagPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import AchievementsPage from './pages/AchievementsPage';
import NotificationsPage from './pages/NotificationsPage';
import RulesPage from './pages/RulesPage';
import ChangePasswordPage from './pages/ChangePasswordPage';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import PublicLayout from './components/PublicLayout';

function App() {
  const { isAuthenticated, isSpectator } = useAuthStore();

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/register"
          element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />}
        />
        <Route element={<PublicLayout />}>
          <Route path="/rules" element={<RulesPage />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={isSpectator ? <Navigate to="/leaderboard" replace /> : <HomePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/tag" element={isSpectator ? <Navigate to="/leaderboard" replace /> : <TagPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/profile" element={isSpectator ? <Navigate to="/leaderboard" replace /> : <ProfilePage />} />
          <Route path="/notifications" element={isSpectator ? <Navigate to="/leaderboard" replace /> : <NotificationsPage />} />
          <Route path="/profile/change-password" element={isSpectator ? <Navigate to="/leaderboard" replace /> : <ChangePasswordPage />} />

          {/* Admin routes */}
          <Route
            path="/admin/*"
            element={<AdminRoute><AdminPage /></AdminRoute>}
          />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Version Indicator at the Top */}
      <div className="fixed top-2 right-4 z-[9999] opacity-30 pointer-events-none">
        <div className="text-[10px] font-mono text-gray-500 bg-black/5 px-2 py-0.5 rounded-full">
          v3.dec26.3
        </div>
      </div>
    </>
  );
}

export default App;
