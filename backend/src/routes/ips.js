import express from 'express';
import { prisma } from '../index.js';
import { scanNetwork } from '../services/scanner.js';

const router = express.Router();

// Get all detected IPs
router.get('/', async (req, res) => {
  try {
    const ips = await prisma.detectedIP.findMany({
      include: {
        scans: {
          orderBy: { scanDate: 'desc' },
          take: 1
        },
        blocked: true
      },
      orderBy: { lastSeen: 'desc' }
    });
    res.json(ips);
  } catch (error) {
    console.error('Error fetching IPs:', error);
    res.status(500).json({ error: 'Failed to fetch IPs' });
  }
});

// Ingest a new IP (mock webhook/sensor endpoint) - Keeping for backwards compatibility
router.post('/ingest', async (req, res) => {
  try {
    const { ipAddress } = req.body;
    
    if (!ipAddress) {
      return res.status(400).json({ error: 'IP address is required' });
    }

    // Upsert the IP address
    const ip = await prisma.detectedIP.upsert({
      where: { ipAddress },
      update: { lastSeen: new Date() },
      create: { 
        ipAddress,
        status: 'UNVERIFIED',
        threatScore: 0
      }
    });

    res.status(201).json({ message: 'IP ingested successfully', ip });
  } catch (error) {
    console.error('Error ingesting IP:', error);
    res.status(500).json({ error: 'Failed to ingest IP' });
  }
});

// Trigger a real network scan
router.post('/scan-network', async (req, res) => {
  try {
    const subnet = req.body.subnet || '192.168.1.0/24';
    const discoveredIps = await scanNetwork(subnet);
    
    const results = [];
    for (const ipAddress of discoveredIps) {
      const ip = await prisma.detectedIP.upsert({
        where: { ipAddress },
        update: { lastSeen: new Date() },
        create: { 
          ipAddress,
          status: 'UNVERIFIED',
          threatScore: 0
        }
      });
      results.push(ip);
    }
    
    res.json({ message: `Scan complete. Found ${discoveredIps.length} active hosts.`, ips: results });
  } catch (error) {
    console.error('Error scanning network:', error);
    res.status(500).json({ error: 'Failed to scan network' });
  }
});

// Get details for a specific IP
router.get('/:ipAddress', async (req, res) => {
  try {
    const { ipAddress } = req.params;
    const ip = await prisma.detectedIP.findUnique({
      where: { ipAddress },
      include: {
        scans: { orderBy: { scanDate: 'desc' } },
        blocked: true
      }
    });

    if (!ip) {
      return res.status(404).json({ error: 'IP not found' });
    }

    res.json(ip);
  } catch (error) {
    console.error('Error fetching IP details:', error);
    res.status(500).json({ error: 'Failed to fetch IP details' });
  }
});

export default router;
