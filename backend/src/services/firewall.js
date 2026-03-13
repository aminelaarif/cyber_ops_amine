import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export const blockIpInFirewall = async (ipAddress) => {
  try {
    console.log(`Blocking IP ${ipAddress} in iptables...`);
    // Drop incoming and outgoing traffic for the IP
    await execPromise(`sudo iptables -A INPUT -s ${ipAddress} -j DROP`);
    await execPromise(`sudo iptables -A FORWARD -s ${ipAddress} -j DROP`);
    console.log(`Successfully blocked ${ipAddress}`);
    return true;
  } catch (error) {
    console.error(`Error blocking IP ${ipAddress}:`, error);
    throw error;
  }
};

export const unblockIpInFirewall = async (ipAddress) => {
  try {
    console.log(`Unblocking IP ${ipAddress} in iptables...`);
    // Remove the rules added above
    await execPromise(`sudo iptables -D INPUT -s ${ipAddress} -j DROP`);
    await execPromise(`sudo iptables -D FORWARD -s ${ipAddress} -j DROP`);
    console.log(`Successfully unblocked ${ipAddress}`);
    return true;
  } catch (error) {
    console.error(`Error unblocking IP ${ipAddress}:`, error);
    throw error;
  }
};
