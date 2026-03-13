import express from 'express';
import { prisma } from '../index.js';
import { blockIpInFirewall, unblockIpInFirewall } from '../services/firewall.js';

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

    // Actually block the IP using iptables
    await blockIpInFirewall(ipAddress);

    res.json({ message: 'IP blocked successfully', blocked });
  } catch (error) {
    console.error('Error blocking IP:', error);
    res.status(500).json({ error: 'Failed to block IP' });
  }
});

// Unblock an IP
router.post('/:ipAddress/unblock', async (req, res) => {
  try {
    const { ipAddress } = req.params;

    // Check if it exists in blockedIP
    const existingBlock = await prisma.blockedIP.findUnique({ where: { ipAddress } });
    if (!existingBlock) {
       return res.status(400).json({ error: 'IP is not currently blocked' });
    }

    // Unblock in iptables
    await unblockIpInFirewall(ipAddress);

    // Remove from DB
    await prisma.blockedIP.delete({ where: { ipAddress } });
    
    // Update status optionally
    await prisma.detectedIP.update({
      where: { ipAddress },
      data: { status: 'SAFE' }
    });

    res.json({ message: 'IP unblocked successfully' });
  } catch (error) {
    console.error('Error unblocking IP:', error);
    res.status(500).json({ error: 'Failed to unblock IP' });
  }
});

export default router;
