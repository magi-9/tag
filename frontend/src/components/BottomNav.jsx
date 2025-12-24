import { NavLink } from 'react-router-dom';
import { Home, Trophy, Target, Award, User, Shield, BookOpen } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import clsx from 'clsx';

export default function BottomNav() {
  const { user } = useAuthStore();

  const navItems = [
    { to: '/', icon: Home, label: 'Domov' },
    { to: '/leaderboard', icon: Trophy, label: 'Rebríček' },
    { to: '/tag', icon: Target, label: 'Tag' },
    { to: '/achievements', icon: Award, label: 'Úspechy' },
    { to: '/rules', icon: BookOpen, label: 'Pravidlá' },
    { to: '/profile', icon: User, label: 'Profil' }
  ];

  if (user?.is_staff) {
    navItems.push({ to: '/admin', icon: Shield, label: 'Admin' });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="container mx-auto px-2">
        <div className="flex justify-around items-center">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center py-2 px-3 min-w-[60px] transition-colors',
                  isActive
                    ? 'text-accent'
                    : 'text-gray-500 hover:text-accent'
                )
              }
            >
              <Icon size={24} />
              <span className="text-xs mt-1 font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
