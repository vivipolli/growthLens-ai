const { PrivateKey } = require('@hashgraph/sdk');

console.log('🔑 Generating Hedera private key...');

// Generate a new ED25519 private key
const privateKey = PrivateKey.generateED25519();
const publicKey = privateKey.publicKey;

console.log('✅ Generated new Hedera key pair:');
console.log('🔑 Private Key (ED25519):', privateKey.toString());
console.log('🔑 Private Key (Raw):', privateKey.toStringRaw());
console.log('🔑 Public Key:', publicKey.toString());

console.log('\n📋 Copy these to your .env file:');
console.log(`HEDERA_PRIVATE_KEY=${privateKey.toString()}`);
console.log(`HEDERA_PUBLIC_KEY=${publicKey.toString()}`);

console.log('\n⚠️  IMPORTANT:');
console.log('1. Save this private key securely');
console.log('2. Never share your private key');
console.log('3. Fund your account with HBAR before using');
console.log('4. Get testnet HBAR from: https://portal.hedera.com/'); 