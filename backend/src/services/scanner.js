import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export const scanNetwork = async (subnet = '192.168.1.0/24') => {
  try {
    // Run an nmap ping scan. The -sn flag tells nmap not to do a port scan after host discovery.
    // -oG - outputs in grepable format to stdout.
    console.log(`Starting nmap scan on ${subnet}...`);
    const { stdout } = await execPromise(`sudo nmap -sn -oG - ${subnet}`);
    
    const ips = [];
    const lines = stdout.split('\n');
    
    for (const line of lines) {
      // Look for lines like: Host: 192.168.1.15 ()Status: Up
      if (line.startsWith('Host:') && line.includes('Status: Up')) {
        const parts = line.split(' ');
        if (parts.length >= 2) {
          ips.push(parts[1]);
        }
      }
    }
    
    console.log(`Scan complete. Found ${ips.length} active hosts.`);
    return ips;
  } catch (error) {
    console.error('Error scanning network:', error);
    throw error;
  }
};
