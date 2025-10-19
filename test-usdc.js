// Quick test to check USDC contract on Base Sepolia
const { createPublicClient, http } = require('viem');
const { baseSepolia } = require('viem/chains');

const client = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org')
});

async function checkUSDC() {
  const usdcAddress = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
  
  try {
    // Check if contract exists
    const code = await client.getBytecode({ address: usdcAddress });
    console.log('USDC Contract Code Length:', code ? code.length : 'No code');
    
    if (code) {
      // Try to read basic USDC functions
      const decimals = await client.readContract({
        address: usdcAddress,
        abi: [{
          inputs: [],
          name: 'decimals',
          outputs: [{ name: '', type: 'uint8' }],
          stateMutability: 'view',
          type: 'function'
        }],
        functionName: 'decimals'
      });
      console.log('USDC Decimals:', decimals);
      
      const symbol = await client.readContract({
        address: usdcAddress,
        abi: [{
          inputs: [],
          name: 'symbol',
          outputs: [{ name: '', type: 'string' }],
          stateMutability: 'view',
          type: 'function'
        }],
        functionName: 'symbol'
      });
      console.log('USDC Symbol:', symbol);
    } else {
      console.log('❌ USDC contract does not exist at this address');
    }
  } catch (error) {
    console.error('Error checking USDC:', error.message);
  }
}

checkUSDC();
