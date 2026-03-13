import express from 'express';
import { prisma } from '../index.js';

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

// Ingest a new IP (mock webhook/sensor endpoint)
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

    // In a real app, this might trigger an async job to scan the IP
    // For now, we'll just return the recorded IP
    res.status(201).json({ message: 'IP ingested successfully', ip });
  } catch (error) {
    console.error('Error ingesting IP:', error);
    res.status(500).json({ error: 'Failed to ingest IP' });
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
