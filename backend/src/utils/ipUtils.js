/**
 * Checks if an IPv4 address is a private or local address.
 * Matches 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, and 127.0.0.0/8
 * @param {string} ip - The IP address to check
 * @returns {boolean} True if the IP is private/local, false otherwise
 */
export const isPrivateIP = (ip) => {
  // Regex for private and local IP ranges
  const privateIPRegex = /^(?:10\.|127\.|172\.(?:1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/;
  return privateIPRegex.test(ip);
};
