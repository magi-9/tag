import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import BottomNav from './BottomNav';
import Header from './Header';

export default function Layout() {
  const { connectWebSocket, disconnectWebSocket } = useGameStore();

  useEffect(() => {
    // Connect to WebSocket on mount
    connectWebSocket();

    return () => {
      // Disconnect on unmount
      disconnectWebSocket();
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      <Header />
      <main className="flex-1 overflow-auto pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
