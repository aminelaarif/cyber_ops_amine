import sudo from 'sudo-prompt';
import util from 'util';

const options = {
  name: 'Cyberops Firewall'
};

const execSudo = util.promisify(sudo.exec);

export const blockIpInFirewall = async (ipAddress) => {
  try {
    console.log(`Blocking IP ${ipAddress} in ufw...`);
    // Deny traffic from the IP using ufw
    await execSudo(`ufw deny from ${ipAddress}`, options);
    console.log(`Successfully blocked ${ipAddress}`);
    return true;
  } catch (error) {
    console.error(`Error blocking IP ${ipAddress}:`, error);
    throw error;
  }
};

export const unblockIpInFirewall = async (ipAddress) => {
  try {
    console.log(`Unblocking IP ${ipAddress} in ufw...`);
    // Remove the deny rule for the IP
    await execSudo(`ufw delete deny from ${ipAddress}`, options);
    console.log(`Successfully unblocked ${ipAddress}`);
    return true;
  } catch (error) {
    console.error(`Error unblocking IP ${ipAddress}:`, error);
    throw error;
  }
};
