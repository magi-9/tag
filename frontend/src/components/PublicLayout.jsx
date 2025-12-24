import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-primary text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">Tag Game</h1>
          <p className="text-sm text-gray-200">Pravidlá a info</p>
        </div>
      </header>

      <main className="flex-1 overflow-auto pb-20">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
