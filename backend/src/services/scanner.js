import sudo from 'sudo-prompt';
import util from 'util';

const options = {
  name: 'Cyberops Scanners'
};

const execSudo = util.promisify(sudo.exec);

export const scanNetwork = async (subnet = '192.168.1.0/24') => {
  try {
    // Run an nmap ping scan. The -sn flag tells nmap not to do a port scan after host discovery.
    // -oG - outputs in grepable format to stdout.
    console.log(`Starting nmap scan on ${subnet} with sudo privileges...`);
    const stdout = await execSudo(`nmap -sn -oG - ${subnet}`, options);
    
    // sudo-prompt 'exec' sometimes returns exactly 'stdout' or directly the string depending on version, 
    // resolving it carefully.
    const outputString = typeof stdout === 'string' ? stdout : stdout?.stdout || String(stdout);

    const ips = [];
    const lines = outputString.split('\n');
    
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
