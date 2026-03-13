import express from 'express';
import { prisma } from '../index.js';

const router = express.Router();

// Mock function to simulate calling Threat Intelligence APIs (e.g. VirusTotal, AbuseIPDB)
const mockThreatScan = async (ipAddress) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Randomly assign a threat score and malicious status for demonstration
  const randomScore = Math.floor(Math.random() * 100);
  const isMalicious = randomScore > 50;
  
  return {
    provider: Math.random() > 0.5 ? 'VirusTotal' : 'AbuseIPDB',
    isMalicious,
    confidence: isMalicious ? randomScore : 100 - randomScore,
    rawResponse: { message: 'This is a mock response from ' + ipAddress }
  };
};

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

    // Perform scan
    const scanResult = await mockThreatScan(ipAddress);
    
    // Determine new status based on scan
    let newStatus = 'SAFE';
    if (scanResult.isMalicious) {
      newStatus = scanResult.confidence > 80 ? 'MALICIOUS' : 'SUSPICIOUS';
    }

    // Update IP record with new threat info
    const updatedIp = await prisma.detectedIP.update({
      where: { ipAddress },
      data: {
        status: newStatus,
        threatScore: scanResult.isMalicious ? scanResult.confidence : 0
      }
    });

    // Create scan record
    const scan = await prisma.threatScan.create({
      data: {
        ipAddress: ipAddress,
        provider: scanResult.provider,
        isMalicious: scanResult.isMalicious,
        confidence: scanResult.confidence,
        rawResponse: scanResult.rawResponse
      }
    });

    res.json({ ip: updatedIp, scan });
  } catch (error) {
    console.error('Error scanning IP:', error);
    res.status(500).json({ error: 'Failed to scan IP' });
  }
});

export default router;
