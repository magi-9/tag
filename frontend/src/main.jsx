import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';
import { registerSW } from './utils/pwa';

// Initialize React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: true,
      retry: 1
    }
  }
});

// Register Service Worker
registerSW();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#2b2d42',
              color: '#fff',
              borderRadius: '12px',
              padding: '16px'
            },
            success: {
              iconTheme: {
                primary: '#51cf66',
                secondary: '#fff'
              }
            },
            error: {
              iconTheme: {
                primary: '#ff6b6b',
                secondary: '#fff'
              }
            }
          }}
        />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
