import { useEffect } from 'react';
import { Box, Grid, GridItem, Text, Flex, HStack, Button, Spinner } from '@chakra-ui/react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Shield, ShieldAlert, AlertTriangle, Activity, RefreshCw, Download, Zap, ScanLine } from 'lucide-react';
import useIPStore from '../store/useIPStore';

const StatCard = ({ icon: Icon, label, value, color, sublabel }) => (
  <Box
    bg="var(--bg-card)"
    border="1px solid"
    borderColor="var(--border-color)"
    borderRadius="xl"
    p="6"
    position="relative"
    overflow="hidden"
    _hover={{ borderColor: color, transition: 'border-color 0.2s' }}
    transition="all 0.2s"
  >
    <Box
      position="absolute"
      top="0"
      right="0"
      w="80px"
      h="80px"
      borderRadius="0 0 0 80px"
      bg={`${color}15`}
    />
    <Flex align="flex-start" justify="space-between">
      <Box>
        <Text color="var(--text-muted)" fontSize="xs" fontWeight="600" letterSpacing="wider" mb="2">
          {label}
        </Text>
        <Text fontSize="3xl" fontWeight="bold" color="white" lineHeight="1">{value}</Text>
        {sublabel && (
          <Text color="var(--text-muted)" fontSize="xs" mt="2">{sublabel}</Text>
        )}
      </Box>
      <Flex
        w="12"
        h="12"
        borderRadius="lg"
        bg={`${color}20`}
        align="center"
        justify="center"
        color={color}
        mt="1"
      >
        <Icon size={22} />
      </Flex>
    </Flex>
  </Box>
);

const COLORS = {
  SAFE: '#10b981',
  SUSPICIOUS: '#eab308',
  MALICIOUS: '#ef4444',
  UNVERIFIED: '#6b7280',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box bg="var(--bg-card)" border="1px solid var(--border-color)" borderRadius="lg" p="3">
        <Text color="var(--text-muted)" fontSize="xs">{label}</Text>
        {payload.map((p, i) => (
          <Text key={i} color={p.color} fontSize="sm" fontWeight="600">{p.name}: {p.value}</Text>
        ))}
      </Box>
    );
  }
  return null;
};

export default function Dashboard() {
  const { ips, stats, isLoading, fetchIPs, fetchAlerts, alerts, scanIP, seedMockData, scanLocalNetwork } = useIPStore();

  useEffect(() => {
    fetchIPs();
    fetchAlerts();
  }, []);

  const pieData = [
    { name: 'Safe', value: stats.safe, color: '#10b981' },
    { name: 'Suspicious', value: stats.suspicious, color: '#eab308' },
    { name: 'Malicious', value: stats.malicious, color: '#ef4444' },
    { name: 'Unverified', value: stats.total - stats.safe - stats.suspicious - stats.malicious, color: '#6b7280' },
  ].filter(d => d.value > 0);

  // Build a timeline from recent scans
  const timelineData = ips
    .slice(0, 12)
    .map((ip, i) => ({
      time: `T-${12 - i}`,
      safe: ip.status === 'SAFE' ? 1 : 0,
      suspicious: ip.status === 'SUSPICIOUS' ? 1 : 0,
      malicious: ip.status === 'MALICIOUS' ? 1 : 0,
    }));

  const handleScanAll = async () => {
    const unscanned = ips.filter(ip => ip.status === 'UNVERIFIED').slice(0, 5);
    for (const ip of unscanned) {
      try { await scanIP(ip.ipAddress); } catch {}
    }
  };

  const handleScanNetwork = async () => {
    try {
      await scanLocalNetwork('192.168.1.0/24');
    } catch (e) {
      console.error(e);
    }
  };

  const exportCSV = () => {
    const headers = ['IP Address', 'Status', 'Threat Score', 'First Seen', 'Last Seen'];
    const rows = ips.map(ip => [
      ip.ipAddress, ip.status, ip.threatScore,
      new Date(ip.firstSeen).toLocaleString(),
      new Date(ip.lastSeen).toLocaleString(),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'network_ips.csv'; a.click();
  };

  return (
    <Box>
      {/* Header Row */}
      <Flex justify="space-between" align="center" mb="8">
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="white">Security Dashboard</Text>
          <Text color="var(--text-muted)" fontSize="sm" mt="1">
            Real-time network threat monitoring
          </Text>
        </Box>
        <HStack gap="3">
          {ips.length === 0 && (
            <Button
              size="sm"
              bg="rgba(139,92,246,0.2)"
              color="#8b5cf6"
              border="1px solid rgba(139,92,246,0.3)"
              borderRadius="lg"
              onClick={seedMockData}
              _hover={{ bg: 'rgba(139,92,246,0.3)' }}
              leftIcon={<Zap size={14} />}
            >
              Seed Mock Data
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            borderColor="var(--border-color)"
            color="var(--text-muted)"
            borderRadius="lg"
            onClick={() => { fetchIPs(); fetchAlerts(); }}
            _hover={{ color: 'white', borderColor: 'white' }}
            leftIcon={<RefreshCw size={14} />}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            bg="rgba(16,185,129,0.15)"
            color="var(--accent-green)"
            border="1px solid rgba(16,185,129,0.3)"
            borderRadius="lg"
            onClick={handleScanNetwork}
            _hover={{ bg: 'rgba(16,185,129,0.25)' }}
            leftIcon={<Activity size={14} />}
          >
            Scan Local Network
          </Button>
          <Button
            size="sm"
            bg="rgba(6,182,212,0.15)"
            color="var(--accent-cyan)"
            border="1px solid rgba(6,182,212,0.3)"
            borderRadius="lg"
            onClick={handleScanAll}
            _hover={{ bg: 'rgba(6,182,212,0.25)' }}
            leftIcon={<ScanLine size={14} />}
          >
            Scan Unverified
          </Button>
          <Button
            size="sm"
            bg="rgba(16,185,129,0.15)"
            color="var(--accent-green)"
            border="1px solid rgba(16,185,129,0.3)"
            borderRadius="lg"
            onClick={exportCSV}
            _hover={{ bg: 'rgba(16,185,129,0.25)' }}
            leftIcon={<Download size={14} />}
          >
            Export CSV
          </Button>
        </HStack>
      </Flex>

      {isLoading ? (
        <Flex justify="center" align="center" h="60" color="var(--text-muted)">
          <Spinner size="lg" color="var(--accent-cyan)" mr="3" />
          <Text>Loading threat intelligence…</Text>
        </Flex>
      ) : (
        <>
          {/* Stat Cards */}
          <Grid templateColumns="repeat(4, 1fr)" gap="5" mb="8">
            <StatCard icon={Activity} label="TOTAL IPs" value={stats.total} color="#06b6d4" sublabel="Detected on network" />
            <StatCard icon={Shield} label="SAFE IPs" value={stats.safe} color="#10b981" sublabel="Verified clean" />
            <StatCard icon={AlertTriangle} label="SUSPICIOUS" value={stats.suspicious} color="#eab308" sublabel="Needs review" />
            <StatCard icon={ShieldAlert} label="MALICIOUS" value={stats.malicious} color="#ef4444" sublabel="Active threats" />
          </Grid>

          {/* Charts */}
          <Grid templateColumns="1fr 1fr" gap="5" mb="8">
            {/* Pie Chart */}
            <Box bg="var(--bg-card)" border="1px solid" borderColor="var(--border-color)" borderRadius="xl" p="6">
              <Text fontWeight="600" color="white" mb="4">Threat Distribution</Text>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      iconType="circle"
                      formatter={(val) => <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{val}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Flex h="220px" align="center" justify="center" color="var(--text-muted)" flexDir="column" gap="2">
                  <Activity size={32} opacity={0.4} />
                  <Text fontSize="sm">No data yet — seed mock IPs or ingest real ones</Text>
                </Flex>
              )}
            </Box>

            {/* Area Chart */}
            <Box bg="var(--bg-card)" border="1px solid" borderColor="var(--border-color)" borderRadius="xl" p="6">
              <Text fontWeight="600" color="white" mb="4">Recent Activity Timeline</Text>
              {timelineData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={timelineData}>
                    <defs>
                      <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorMalicious" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="time" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                    <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="safe" stroke="#10b981" fill="url(#colorSafe)" name="Safe" strokeWidth={2} />
                    <Area type="monotone" dataKey="suspicious" stroke="#eab308" fill="none" name="Suspicious" strokeWidth={2} />
                    <Area type="monotone" dataKey="malicious" stroke="#ef4444" fill="url(#colorMalicious)" name="Malicious" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Flex h="220px" align="center" justify="center" color="var(--text-muted)" flexDir="column" gap="2">
                  <Activity size={32} opacity={0.4} />
                  <Text fontSize="sm">No activity data yet</Text>
                </Flex>
              )}
            </Box>
          </Grid>

          {/* Recent Alerts */}
          <Box bg="var(--bg-card)" border="1px solid" borderColor="var(--border-color)" borderRadius="xl" p="6">
            <Flex justify="space-between" align="center" mb="4">
              <Text fontWeight="600" color="white">Recent Alerts</Text>
              <Text fontSize="xs" color="var(--accent-red)">{alerts.length} active</Text>
            </Flex>
            {alerts.length === 0 ? (
              <Flex align="center" justify="center" h="16" color="var(--text-muted)" fontSize="sm">
                <Shield size={16} style={{ marginRight: 8 }} /> No active alerts
              </Flex>
            ) : (
              <Box>
                {alerts.slice(0, 5).map((alert) => (
                  <Flex
                    key={alert.id}
                    align="center"
                    justify="space-between"
                    py="3"
                    borderBottom="1px solid"
                    borderColor="var(--border-color)"
                    _last={{ borderBottom: 'none' }}
                  >
                    <HStack gap="3">
                      <Box
                        w="2"
                        h="2"
                        borderRadius="full"
                        bg={alert.status === 'MALICIOUS' ? 'var(--accent-red)' : 'var(--accent-yellow)'}
                        boxShadow={`0 0 6px ${alert.status === 'MALICIOUS' ? 'var(--accent-red)' : 'var(--accent-yellow)'}`}
                        flexShrink="0"
                      />
                      <Text color="white" fontSize="sm" fontFamily="mono">{alert.ipAddress}</Text>
                    </HStack>
                    <HStack gap="4">
                      <Box
                        px="2"
                        py="1"
                        borderRadius="md"
                        bg={alert.status === 'MALICIOUS' ? 'rgba(239,68,68,0.15)' : 'rgba(234,179,8,0.15)'}
                        color={alert.status === 'MALICIOUS' ? 'var(--accent-red)' : 'var(--accent-yellow)'}
                        fontSize="xs"
                        fontWeight="600"
                      >
                        {alert.status}
                      </Box>
                      <Text color="var(--text-muted)" fontSize="xs">
                        Score: {alert.threatScore}
                      </Text>
                    </HStack>
                  </Flex>
                ))}
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
