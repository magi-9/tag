import { create } from 'zustand';

export const useGameStore = create((set, get) => ({
  // WebSocket connection
  ws: null,
  isConnected: false,
  
  // Game state
  currentHolder: null,
  leaderboard: [],
  recentTags: [],
  achievements: [],
  gameSettings: null,
  
  // Connect to WebSocket
  connectWebSocket: () => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/game/';
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        set({ isConnected: true, ws });
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'new_tag':
            set((state) => ({
              recentTags: [data.data, ...state.recentTags].slice(0, 10)
            }));
            break;
          
          case 'leaderboard_update':
            set({ leaderboard: data.data });
            break;
          
          case 'game_update':
            // Handle other game updates
            break;
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        set({ isConnected: false, ws: null });
        
        // Attempt to reconnect after 5 seconds using current store methods
        setTimeout(() => {
          const state = get();
          if (!state.isConnected && typeof state.connectWebSocket === 'function') {
            state.connectWebSocket();
          }
        }, 5000);
      };
      
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  },
  
  disconnectWebSocket: () => {
    set((state) => {
      if (state.ws) {
        state.ws.close();
      }
      return { ws: null, isConnected: false };
    });
  },
  
  setCurrentHolder: (holder) => set({ currentHolder: holder }),
  setLeaderboard: (leaderboard) => set({ leaderboard }),
  setAchievements: (achievements) => set({ achievements }),
  setGameSettings: (settings) => set({ gameSettings: settings })
}));
