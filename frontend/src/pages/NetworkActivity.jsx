import { useEffect, useState, useMemo } from 'react';
import {
  Box, Flex, Text, Button, HStack, Input, Badge,
} from '@chakra-ui/react';
import {
  useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel,
  flexRender, createColumnHelper,
} from '@tanstack/react-table';
import { Search, ScanLine, ShieldBan, ShieldCheck, RefreshCw, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import useIPStore from '../store/useIPStore';

const statusColors = {
  SAFE: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  SUSPICIOUS: { bg: 'rgba(234,179,8,0.15)', color: '#eab308' },
  MALICIOUS: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  UNVERIFIED: { bg: 'rgba(107,114,128,0.15)', color: '#9ca3af' },
};

const columnHelper = createColumnHelper();

export default function NetworkActivity() {
  const { ips, isLoading, fetchIPs, scanIP, blockIP, unblockIP } = useIPStore();
  const [globalFilter, setGlobalFilter] = useState('');
  const [scanning, setScanning] = useState({});
  const [blocking, setBlocking] = useState({});
  const [notification, setNotification] = useState(null);

  useEffect(() => { fetchIPs(); }, []);

  const showNotif = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleScan = async (ipAddress) => {
    setScanning(prev => ({ ...prev, [ipAddress]: true }));
    try {
      await scanIP(ipAddress);
      showNotif(`✓ Scanned ${ipAddress}`);
    } catch {
      showNotif(`✗ Scan failed for ${ipAddress}`, 'error');
    } finally {
      setScanning(prev => ({ ...prev, [ipAddress]: false }));
    }
  };

  const handleBlock = async (ipAddress) => {
    setBlocking(prev => ({ ...prev, [ipAddress]: true }));
    try {
      await blockIP(ipAddress, 'Manually blocked by operator');
      showNotif(`✓ Blocked ${ipAddress}`);
    } catch (e) {
      showNotif(`✗ ${e.message}`, 'error');
    } finally {
      setBlocking(prev => ({ ...prev, [ipAddress]: false }));
    }
  };

  const handleUnblock = async (ipAddress) => {
    setBlocking(prev => ({ ...prev, [ipAddress]: true }));
    try {
      await unblockIP(ipAddress);
      showNotif(`✓ Unblocked ${ipAddress}`);
    } catch (e) {
      showNotif(`✗ ${e.message}`, 'error');
    } finally {
      setBlocking(prev => ({ ...prev, [ipAddress]: false }));
    }
  };

  const columns = useMemo(() => [
    columnHelper.accessor('ipAddress', {
      header: 'IP Address',
      cell: info => (
        <Text fontFamily="mono" fontWeight="600" color="white" fontSize="sm">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => {
        const s = info.getValue();
        const c = statusColors[s] || statusColors.UNVERIFIED;
        return (
          <Box
            display="inline-block"
            px="2.5"
            py="1"
            borderRadius="full"
            bg={c.bg}
            color={c.color}
            fontSize="xs"
            fontWeight="700"
            letterSpacing="wide"
          >
            {s}
          </Box>
        );
      },
    }),
    columnHelper.accessor('threatScore', {
      header: 'Threat Score',
      cell: info => {
        const score = info.getValue();
        const color = score > 70 ? '#ef4444' : score > 30 ? '#eab308' : '#10b981';
        return (
          <Flex align="center" gap="2">
            <Box
              w="8"
              h="8"
              borderRadius="full"
              bg={`${color}15`}
              border={`2px solid ${color}`}
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="xs"
              fontWeight="700"
              color={color}
            >
              {score}
            </Box>
          </Flex>
        );
      },
    }),
    columnHelper.accessor('firstSeen', {
      header: 'First Seen',
      cell: info => (
        <Text color="var(--text-muted)" fontSize="xs">
          {new Date(info.getValue()).toLocaleString()}
        </Text>
      ),
    }),
    columnHelper.accessor('lastSeen', {
      header: 'Last Seen',
      cell: info => (
        <Text color="var(--text-muted)" fontSize="xs">
          {new Date(info.getValue()).toLocaleString()}
        </Text>
      ),
    }),
    columnHelper.accessor('blocked', {
      header: 'Blocked',
      cell: info => (
        <Text fontSize="xs" color={info.getValue() ? 'var(--accent-red)' : 'var(--text-muted)'}>
          {info.getValue() ? '🚫 Yes' : '—'}
        </Text>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: row => {
        const ip = row.row.original;
        return (
          <HStack gap="2">
            <Button
              size="xs"
              bg="rgba(6,182,212,0.15)"
              color="var(--accent-cyan)"
              border="1px solid rgba(6,182,212,0.3)"
              borderRadius="md"
              loading={scanning[ip.ipAddress]}
              onClick={() => handleScan(ip.ipAddress)}
              _hover={{ bg: 'rgba(6,182,212,0.3)' }}
            >
              <ScanLine size={12} style={{ marginRight: 4 }} /> Scan
            </Button>
            {!ip.blocked && (
              <Button
                size="xs"
                bg="rgba(239,68,68,0.1)"
                color="var(--accent-red)"
                border="1px solid rgba(239,68,68,0.25)"
                borderRadius="md"
                loading={blocking[ip.ipAddress]}
                onClick={() => handleBlock(ip.ipAddress)}
                _hover={{ bg: 'rgba(239,68,68,0.2)' }}
              >
                <ShieldBan size={12} style={{ marginRight: 4 }} /> Block
              </Button>
            )}
            {ip.blocked && (
              <Button
                size="xs"
                bg="rgba(16,185,129,0.1)"
                color="var(--accent-green)"
                border="1px solid rgba(16,185,129,0.25)"
                borderRadius="md"
                loading={blocking[ip.ipAddress]}
                onClick={() => handleUnblock(ip.ipAddress)}
                _hover={{ bg: 'rgba(16,185,129,0.2)' }}
              >
                <ShieldCheck size={12} style={{ marginRight: 4 }} /> Unblock
              </Button>
            )}
          </HStack>
        );
      },
    }),
  ], [scanning, blocking]);

  const table = useReactTable({
    data: ips,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Box>
      {/* Notification */}
      {notification && (
        <Box
          position="fixed"
          top="5"
          right="5"
          bg={notification.type === 'error' ? 'rgba(239,68,68,0.9)' : 'rgba(16,185,129,0.9)'}
          color="white"
          px="5"
          py="3"
          borderRadius="xl"
          zIndex="100"
          boxShadow="xl"
          fontSize="sm"
          fontWeight="600"
          backdropFilter="blur(10px)"
        >
          {notification.msg}
        </Box>
      )}

      {/* Header */}
      <Flex justify="space-between" align="center" mb="6">
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="white">Network Activity</Text>
          <Text color="var(--text-muted)" fontSize="sm" mt="1">
            {ips.length} IP addresses detected
          </Text>
        </Box>
        <Button
          size="sm"
          variant="outline"
          borderColor="var(--border-color)"
          color="var(--text-muted)"
          borderRadius="lg"
          onClick={fetchIPs}
          _hover={{ color: 'white', borderColor: 'white' }}
        >
          <RefreshCw size={14} style={{ marginRight: 6 }} /> Refresh
        </Button>
      </Flex>

      {/* Table Container */}
      <Box bg="var(--bg-card)" border="1px solid" borderColor="var(--border-color)" borderRadius="xl" overflow="hidden">
        {/* Search Bar */}
        <Box p="4" borderBottom="1px solid" borderColor="var(--border-color)">
          <Flex gap="2" align="center" bg="var(--bg-dark)" borderRadius="lg" px="4" py="2.5">
            <Search size={16} color="var(--text-muted)" />
            <Input
              border="none"
              bg="transparent"
              placeholder="Search IP, status…"
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              color="white"
              _placeholder={{ color: 'var(--text-muted)', fontSize: 'sm' }}
              _focus={{ boxShadow: 'none', outline: 'none' }}
              h="7"
              pl="2"
            />
          </Flex>
        </Box>

        {/* Table */}
        <Box overflowX="auto">
          <Box as="table" w="full">
            <Box as="thead" bg="var(--bg-dark)">
              {table.getHeaderGroups().map(hg => (
                <Box as="tr" key={hg.id}>
                  {hg.headers.map(header => (
                    <Box
                      as="th"
                      key={header.id}
                      px="5"
                      py="3"
                      textAlign="left"
                      fontSize="xs"
                      color="var(--text-muted)"
                      fontWeight="600"
                      letterSpacing="wider"
                      cursor={header.column.getCanSort() ? 'pointer' : 'default'}
                      onClick={header.column.getToggleSortingHandler()}
                      userSelect="none"
                    >
                      <Flex align="center" gap="1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <Box color="var(--border-color)" ml="1">
                            {header.column.getIsSorted() === 'asc' ? <ChevronUp size={12} /> :
                             header.column.getIsSorted() === 'desc' ? <ChevronDown size={12} /> :
                             <ChevronsUpDown size={12} />}
                          </Box>
                        )}
                      </Flex>
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>
            <Box as="tbody">
              {table.getRowModel().rows.length === 0 ? (
                <Box as="tr">
                  <Box as="td" colSpan={7} textAlign="center" py="16" color="var(--text-muted)" fontSize="sm">
                    No IPs detected. Use "Seed Mock Data" on the Dashboard or ingest real IPs via the API.
                  </Box>
                </Box>
              ) : (
                table.getRowModel().rows.map(row => (
                  <Box
                    as="tr"
                    key={row.id}
                    borderTop="1px solid"
                    borderColor="var(--border-color)"
                    _hover={{ bg: 'rgba(255,255,255,0.02)' }}
                    transition="background 0.15s"
                  >
                    {row.getVisibleCells().map(cell => (
                      <Box as="td" key={cell.id} px="5" py="3.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </Box>
                    ))}
                  </Box>
                ))
              )}
            </Box>
          </Box>
        </Box>

        {/* Footer */}
        <Flex
          align="center"
          justify="space-between"
          px="5"
          py="3"
          borderTop="1px solid"
          borderColor="var(--border-color)"
        >
          <Text fontSize="xs" color="var(--text-muted)">
            Showing {table.getRowModel().rows.length} of {ips.length} results
          </Text>
          <Text fontSize="xs" color="var(--text-muted)">
            Last refreshed: {new Date().toLocaleTimeString()}
          </Text>
        </Flex>
      </Box>
    </Box>
  );
}
