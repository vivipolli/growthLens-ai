const { createNewTopic } = require('./create-new-topic');
const fs = require('fs');
const path = require('path');

async function freshStart() {
  try {
    console.log('🚀 Starting fresh start process...\n');
    
    // Step 1: Create new topic
    console.log('📋 Step 1: Creating new topic...');
    const newTopicId = await createNewTopic();
    
    // Step 2: Clear all data files
    console.log('\n🗑️  Step 2: Clearing all data files...');
    
    const dataDir = path.join(__dirname, '../data');
    const filesToClear = [
      'userTopics.json',
      'testData.json',
      'cache.json'
    ];
    
    for (const file of filesToClear) {
      const filePath = path.join(dataDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ Deleted: ${file}`);
      } else {
        console.log(`ℹ️  File not found: ${file}`);
      }
    }
    
    // Step 3: Create fresh user topics file
    console.log('\n📁 Step 3: Creating fresh user topics file...');
    const userTopicsFile = path.join(dataDir, 'userTopics.json');
    fs.writeFileSync(userTopicsFile, JSON.stringify({}, null, 2));
    console.log('✅ Fresh user topics file created');
    
    // Step 4: Create test data
    console.log('\n🧪 Step 4: Creating test data...');
    
    const testData = {
      "test-user": {
        "userId": "test-user",
        "topicId": newTopicId.toString(),
        "createdAt": new Date().toISOString(),
        "memo": "Test user for fresh start"
      },
      "Maria Silva": {
        "userId": "Maria Silva", 
        "topicId": newTopicId.toString(),
        "createdAt": new Date().toISOString(),
        "memo": "Maria Silva fresh start"
      }
    };
    
    fs.writeFileSync(userTopicsFile, JSON.stringify(testData, null, 2));
    console.log('✅ Test user topics created');
    
    // Step 5: Create test data file
    console.log('\n📊 Step 5: Creating test data structure...');
    const testDataFile = path.join(dataDir, 'testData.json');
    const testDataStructure = {
      "test-user": {
        "userProfile": {
          "name": "Test User",
          "age": 30,
          "location": "São Paulo, Brazil",
          "primary_motivation": "Financial freedom"
        },
        "businessData": {
          "industry": "Digital Marketing",
          "age_range": "26-35 years old",
          "gender": "Mixed gender",
          "income_level": "Middle class ($50k-$80k/year)"
        },
        "aiInsights": [],
        "missionCompletions": []
      },
      "Maria Silva": {
        "userProfile": {
          "name": "Maria Silva",
          "age": 28,
          "location": "Rio de Janeiro, Brazil", 
          "primary_motivation": "Business growth"
        },
        "businessData": {
          "industry": "Digital Marketing",
          "age_range": "26-35 years old",
          "gender": "Mixed gender",
          "income_level": "Middle class ($50k-$80k/year)"
        },
        "aiInsights": [],
        "missionCompletions": []
      }
    };
    
    fs.writeFileSync(testDataFile, JSON.stringify(testDataStructure, null, 2));
    console.log('✅ Test data structure created');
    
    console.log('\n🎉 Fresh start completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • New Topic ID: ${newTopicId}`);
    console.log(`   • User topics cleared and recreated`);
    console.log(`   • Test users: test-user, Maria Silva`);
    console.log(`   • All data files reset`);
    
    console.log('\n💡 Next steps:');
    console.log('   1. Restart your backend server');
    console.log('   2. Test with: curl http://localhost:3001/api/business/user/test-user/data');
    console.log('   3. Create new data using the API endpoints');
    
    return newTopicId;
    
  } catch (error) {
    console.error('❌ Fresh start failed:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  freshStart()
    .then(() => {
      console.log('\n✅ Fresh start script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Fresh start script failed:', error);
      process.exit(1);
    });
}

module.exports = { freshStart }; 