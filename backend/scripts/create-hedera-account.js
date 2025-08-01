const { 
  Client, 
  AccountCreateTransaction, 
  PrivateKey, 
  AccountId,
  Hbar 
} = require('@hashgraph/sdk');

async function createAccount() {
  try {
    console.log('🔑 Creating new Hedera account...');
    
    // Use the private key we generated
    const privateKey = PrivateKey.fromStringED25519('302e020100300506032b657004220420af8c3676b8ce5e22751a58f57ecc011258dd868748e88096555f88d2bfeaa455');
    const publicKey = privateKey.publicKey;
    
    console.log('🔑 Private Key:', privateKey.toString());
    console.log('🔑 Public Key:', publicKey.toString());
    
    // Create client with testnet
    const client = Client.forTestnet();
    
    // For creating a new account, we need to use a funded account
    // Let's use the Hedera testnet faucet account
    const operatorId = AccountId.fromString('0.0.2');
    const operatorKey = PrivateKey.fromStringED25519('302e020100300506032b65700422042091132178e72057a1d752802595456fe4e3c8b5a7f9e1b2c3d4e5f6a7b8c9d0e1f2');
    
    client.setOperator(operatorId, operatorKey);
    
    console.log('🔄 Creating account...');
    
    // Create the new account
    const transaction = new AccountCreateTransaction()
      .setKey(publicKey)
      .setInitialBalance(new Hbar(2)); // 2 HBAR initial balance
    
    const response = await transaction.execute(client);
    const receipt = await response.getReceipt(client);
    const newAccountId = receipt.accountId;
    
    console.log('✅ Account created successfully!');
    console.log('🔑 New Account ID:', newAccountId.toString());
    console.log('💰 Initial Balance: 2 HBAR');
    
    console.log('\n📋 Update your .env file with:');
    console.log(`HEDERA_ACCOUNT_ID=${newAccountId.toString()}`);
    console.log(`HEDERA_PRIVATE_KEY=${privateKey.toString()}`);
    
    console.log('\n⚠️  IMPORTANT:');
    console.log('1. The account is funded with 2 HBAR for testing');
    console.log('2. You can get more testnet HBAR from: https://portal.hedera.com/');
    console.log('3. This account is ready to use with your application');
    
  } catch (error) {
    console.error('❌ Error creating account:', error);
    
    if (error.message.includes('INSUFFICIENT_PAYER_BALANCE')) {
      console.log('\n💡 Alternative: Use the Hedera Portal to create an account');
      console.log('1. Go to: https://portal.hedera.com/');
      console.log('2. Create a new account');
      console.log('3. Copy the Account ID and Private Key');
      console.log('4. Update your .env file');
    }
  }
}

createAccount(); 