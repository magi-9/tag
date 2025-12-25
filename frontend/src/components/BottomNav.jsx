import { NavLink } from 'react-router-dom';
import { Home, Trophy, Target, Award, User, Shield, BookOpen } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import clsx from 'clsx';

export default function BottomNav() {
  const { user, isSpectator } = useAuthStore();

  const allItems = [
    { to: '/', icon: Home, label: 'Domov', hideForSpectator: true },
    { to: '/leaderboard', icon: Trophy, label: 'Rebríček' },
    { to: '/tag', icon: Target, label: 'Tag', hideForSpectator: true },
    { to: '/achievements', icon: Award, label: 'Úspechy' },
    { to: '/rules', icon: BookOpen, label: 'Pravidlá' },
    { to: '/profile', icon: User, label: 'Profil', hideForSpectator: true }
  ];

  const navItems = allItems.filter(item => !isSpectator || !item.hideForSpectator);

  if (user?.is_staff) {
    navItems.push({ to: '/admin', icon: Shield, label: 'Admin' });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50 px-safe">
      <div className="container mx-auto">
        <div className="flex justify-between items-center overflow-x-auto no-scrollbar py-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center py-2 px-1 min-w-[56px] flex-1 transition-all duration-300',
                  isActive
                    ? 'text-accent scale-110'
                    : 'text-gray-400 hover:text-accent'
                )
              }
            >
              <div className={clsx(
                "p-1 rounded-xl transition-colors",
                "group-hover:bg-accent/5"
              )}>
                <Icon size={20} />
              </div>
              <span className="text-[10px] mt-0.5 font-bold tracking-tight text-center leading-none">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
