import { checkIpWithAbuseIPDB } from './src/services/ipdb.js';

async function test() {
  try {
    const data = await checkIpWithAbuseIPDB('8.8.8.8');
    console.log('Result:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

test();
