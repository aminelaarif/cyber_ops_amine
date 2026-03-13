import { create } from 'zustand';
import useAuthStore from './useAuthStore';

const API_URL = 'http://localhost:3000';

const getHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const useIPStore = create((set, get) => ({
  ips: [],
  alerts: [],
  isLoading: false,
  error: null,
  stats: {
    total: 0,
    safe: 0,
    suspicious: 0,
    malicious: 0,
    blocked: 0,
  },

  fetchIPs: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/ips`, { headers: getHeaders() });
      const data = await res.json();
      const ips = Array.isArray(data) ? data : [];
      
      const stats = {
        total: ips.length,
        safe: ips.filter(ip => ip.status === 'SAFE').length,
        suspicious: ips.filter(ip => ip.status === 'SUSPICIOUS').length,
        malicious: ips.filter(ip => ip.status === 'MALICIOUS').length,
        blocked: ips.filter(ip => ip.blocked !== null).length,
      };

      set({ ips, stats, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchAlerts: async () => {
    try {
      const res = await fetch(`${API_URL}/api/alerts`, { headers: getHeaders() });
      const alerts = await res.json();
      set({ alerts: Array.isArray(alerts) ? alerts : [] });
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  },

  scanIP: async (ipAddress) => {
    const res = await fetch(`${API_URL}/api/scans/${ipAddress}/scan`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Scan failed');
    // Refresh IPs after scan
    get().fetchIPs();
    return await res.json();
  },

  ingestIP: async (ipAddress) => {
    const res = await fetch(`${API_URL}/api/ips/ingest`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ ipAddress }),
    });
    if (!res.ok) throw new Error('Ingest failed');
    get().fetchIPs();
    return await res.json();
  },

  blockIP: async (ipAddress, reason) => {
    const res = await fetch(`${API_URL}/api/alerts/${ipAddress}/block`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason, blockedBy: 'USER' }),
    });
    if (!res.ok) throw new Error('Block failed');
    get().fetchIPs();
    return await res.json();
  },

  unblockIP: async (ipAddress) => {
    const res = await fetch(`${API_URL}/api/alerts/${ipAddress}/unblock`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Unblock failed');
    get().fetchIPs();
    return await res.json();
  },

  scanLocalNetwork: async (subnet = '192.168.1.0/24') => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/api/ips/scan-network`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ subnet }),
      });
      if (!res.ok) throw new Error('Network scan failed');
      const data = await res.json();
      get().fetchIPs();
      return data;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  seedMockData: async () => {
    const mockIPs = [
      '192.168.1.1', '10.0.0.5', '172.16.0.10', '203.0.113.5',
      '198.51.100.42', '45.33.32.156', '8.8.8.8', '1.1.1.1',
      '91.108.4.1', '162.158.0.1',
    ];
    for (const ip of mockIPs) {
      try {
        await fetch(`${API_URL}/api/ips/ingest`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ ipAddress: ip }),
        });
      } catch {}
    }
    get().fetchIPs();
  },
}));

export default useIPStore;
