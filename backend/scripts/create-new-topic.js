const { Client, AccountId, PrivateKey, TopicCreateTransaction } = require('@hashgraph/sdk');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

async function createNewTopic() {
  try {
    console.log('🔄 Creating new topic for fresh start...');
    
    // Initialize Hedera client
    const client = Client.forTestnet();
    
    const accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
    const privateKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
    
    client.setOperator(accountId, privateKey);
    
    // Create new topic
    const transaction = new TopicCreateTransaction()
      .setTopicMemo('Fresh start - GrowthLens AI')
      .setMaxTransactionFee(1000000000); // 1 HBAR
    
    console.log('📝 Submitting topic creation transaction...');
    const response = await transaction.execute(client);
    const receipt = await response.getReceipt(client);
    
    const newTopicId = receipt.topicId;
    console.log(`✅ New topic created: ${newTopicId}`);
    
    // Clear user topics storage
    const userTopicsFile = path.join(__dirname, '../data/userTopics.json');
    
    if (fs.existsSync(userTopicsFile)) {
      console.log('🗑️  Clearing existing user topics...');
      fs.writeFileSync(userTopicsFile, JSON.stringify({}, null, 2));
      console.log('✅ User topics storage cleared');
    } else {
      console.log('📁 Creating new user topics file...');
      fs.writeFileSync(userTopicsFile, JSON.stringify({}, null, 2));
      console.log('✅ New user topics file created');
    }
    
    console.log('\n🎉 Fresh start completed!');
    console.log(`📋 New Topic ID: ${newTopicId}`);
    console.log('🗑️  User topics storage cleared');
    console.log('\n💡 To use this new topic, update your .env file:');
    console.log(`   HEDERA_TOPIC_ID=${newTopicId}`);
    
    return newTopicId;
    
  } catch (error) {
    console.error('❌ Error creating new topic:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  createNewTopic()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { createNewTopic }; 