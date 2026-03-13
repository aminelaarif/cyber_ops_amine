import express from 'express';
import { prisma } from '../index.js';

const router = express.Router();

// Get all alerts (Recent MALICIOUS/SUSPICIOUS IPs)
router.get('/', async (req, res) => {
  try {
    const alerts = await prisma.detectedIP.findMany({
      where: {
        status: { in: ['MALICIOUS', 'SUSPICIOUS'] }
      },
      include: {
        scans: {
          orderBy: { scanDate: 'desc' },
          take: 1
        }
      },
      orderBy: { lastSeen: 'desc' },
      take: 50 // Recent 50 alerts
    });
    
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Block an IP
router.post('/:ipAddress/block', async (req, res) => {
  try {
    const { ipAddress } = req.params;
    const { reason, blockedBy } = req.body;

    if (!reason || !blockedBy) {
      return res.status(400).json({ error: 'Reason and blockedBy are required' });
    }

    // Check if it exists
    let ip = await prisma.detectedIP.findUnique({ where: { ipAddress } });
    
    if (!ip) {
       ip = await prisma.detectedIP.create({ data: { ipAddress, status: 'MALICIOUS' } })
    }
    
    // Check if already blocked
    const existingBlock = await prisma.blockedIP.findUnique({ where: { ipAddress } });
    if (existingBlock) {
       return res.status(400).json({ error: 'IP is already blocked' });
    }

    const blocked = await prisma.blockedIP.create({
      data: {
        ipAddress,
        reason,
        blockedBy
      }
    });

    res.json({ message: 'IP blocked successfully', blocked });
  } catch (error) {
    console.error('Error blocking IP:', error);
    res.status(500).json({ error: 'Failed to block IP' });
  }
});

export default router;
