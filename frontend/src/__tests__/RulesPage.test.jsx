import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RulesPage from '../pages/RulesPage';

// Mock API
vi.mock('../utils/api', () => ({
  gameAPI: {
    getSettings: vi.fn(() => Promise.resolve({
      data: {
        game_period: {
          start: '2025-12-24T00:00:00Z',
          end: '2026-01-23T00:00:00Z'
        },
        scoring: {
          rank_1: 50,
          rank_2: 40,
          rank_3: 30,
          rank_4: 20,
          rank_5: 10,
          rank_6_plus: 5,
          time_penalty_per_hour: 5,
          untagged_day_bonus: 35
        },
        prizes: {
          first_place: 'Main prize',
          last_place: 'Anti-prize'
        }
      }
    }))
  }
}));

describe('RulesPage', () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  it('renders rules page title', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <RulesPage />
      </QueryClientProvider>
    );

    expect(screen.getByText(/Pravidlá/i)).toBeDefined();
  });

  it('displays game scoring', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <RulesPage />
      </QueryClientProvider>
    );

    await new Promise(resolve => setTimeout(resolve, 500));
    expect(screen.getByText(/Bodovanie/i)).toBeDefined();
  });
});
