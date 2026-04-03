import axios from 'axios';
import { isPrivateIP } from '../utils/ipUtils.js';

// The AbuseIPDB API Key provided by the user
const API_KEY = '018720f288efeab32903f5687bddff351c37dbe8f8fc6d2094bd2503b961f84f86c80ff4ce4e2b7a';

export const checkIpWithAbuseIPDB = async (ipAddress) => {
  // Do not check local or private IPs as they are not supported by Threat Intel APIs
  if (isPrivateIP(ipAddress)) {
    return {
      ipAddress,
      isPublic: false,
      abuseConfidenceScore: 0,
      // Provide minimal mocked data for private IPs to avoid errors
      reason: 'Local or private IP. Skipped external scan.',
    };
  }

  try {
    const response = await axios.get('https://api.abuseipdb.com/api/v2/check', {
      params: {
        ipAddress,
        maxAgeInDays: 90
      },
      headers: {
        'Accept': 'application/json',
        'Key': API_KEY
      }
    });

    console.log(response.data.data)
  } catch (error) {
    console.error(`Error checking IP ${ipAddress} with AbuseIPDB:`, error?.response?.data || error.message);
    throw error;
  }
};
