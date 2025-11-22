import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InMemoryClientProvider } from './in-memory-client-provider';
import { NetworkObserver } from './network-observer';

// Mock NetworkObserver
vi.mock('./network-observer');

// Mock localStorage for the node environment
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('InMemoryClientProvider', () => {
  const networkObserver = new NetworkObserver();

  beforeEach(() => {
    localStorage.clear();
    InMemoryClientProvider._clearClientStatusStoreForTesting();
  });

  it('should set a client as offline and report it', async () => {
    const provider1 = new InMemoryClientProvider(networkObserver);
    localStorage.clear(); // Ensure next provider gets a new ID
    const provider2 = new InMemoryClientProvider(networkObserver);

    await provider1.setOnline();
    await provider2.setOffline();

    const offlineClients = await provider2.getOfflineClients();
    expect(offlineClients).toContain(provider2.getCurrentClientId());
    expect(offlineClients).not.toContain(provider1.getCurrentClientId());
  });

  it('should correctly report multiple offline clients', async () => {
    const provider1 = new InMemoryClientProvider(networkObserver);
    localStorage.clear();
    const provider2 = new InMemoryClientProvider(networkObserver);
    localStorage.clear();
    const provider3 = new InMemoryClientProvider(networkObserver);

    await provider1.setOffline();
    await provider2.setOnline();
    await provider3.setOffline();

    const offlineClients = await provider1.getOfflineClients();
    expect(offlineClients).toContain(provider1.getCurrentClientId());
    expect(offlineClients).not.toContain(provider2.getCurrentClientId());
    expect(offlineClients).toContain(provider3.getCurrentClientId());
  });
});
