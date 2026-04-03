import express from 'express';
import { prisma } from '../index.js';

const router = express.Router();

import { checkIpWithAbuseIPDB } from '../services/ipdb.js';

router.post('/:ipAddress/scan', async (req, res) => {
  try {
    const { ipAddress } = req.params;
    
    // First ensure the IP exists in our system
    let ip = await prisma.detectedIP.findUnique({ where: { ipAddress } });
    
    if (!ip) {
      ip = await prisma.detectedIP.create({
        data: { ipAddress }
      });
    }

    // Perform scan with real data
    const abuseData = await checkIpWithAbuseIPDB(ipAddress);
    
    // Determine new status based on scan
    const confidence = abuseData.abuseConfidenceScore || 0;
    const isMalicious = confidence > 0;
    
    let newStatus = 'CLEAN'; // Match ingest logic
    if (isMalicious) {
      newStatus = 'MALICIOUS';
    }

    // Update IP record with new threat info
    const updatedIp = await prisma.detectedIP.update({
      where: { ipAddress },
      data: {
        status: newStatus,
        threatScore: confidence
      }
    });

    // Create scan record
    const scan = await prisma.threatScan.create({
      data: {
        ipAddress: ipAddress,
        provider: 'AbuseIPDB',
        isMalicious: isMalicious,
        confidence: confidence,
        rawResponse: abuseData
      }
    });

    res.json({ ip: updatedIp, scan });
  } catch (error) {
    console.error('Error scanning IP:', error);
    res.status(500).json({ error: 'Failed to scan IP' });
  }
});

export default router;
