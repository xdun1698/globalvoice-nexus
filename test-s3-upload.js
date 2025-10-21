const { S3Client, PutObjectCommand, ListObjectsV2Command } = require('./backend/node_modules/@aws-sdk/client-s3');

// Test S3 upload with your credentials
const s3Client = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'AKIAYBNQ2TY3FWYRJFDG',
    secretAccessKey: 'zpXldt9qs2nBDMHPubZLi30LYM7XUGnkIKcAsX9n'
  }
});

const bucket = 'globalvoice-audio';

async function testS3() {
  console.log('🧪 Testing S3 Connection...\n');
  
  try {
    // Test 1: Upload a test file
    console.log('1️⃣ Uploading test file...');
    const testContent = 'This is a test file from GlobalVoice Nexus';
    const key = `test/test-${Date.now()}.txt`;
    
    await s3Client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: testContent,
      ContentType: 'text/plain'
    }));
    
    console.log(`✅ Upload successful: ${key}`);
    console.log(`   URL: https://${bucket}.s3.us-east-1.amazonaws.com/${key}\n`);
    
    // Test 2: List objects
    console.log('2️⃣ Listing bucket contents...');
    const listResult = await s3Client.send(new ListObjectsV2Command({
      Bucket: bucket,
      MaxKeys: 10
    }));
    
    if (listResult.Contents && listResult.Contents.length > 0) {
      console.log(`✅ Found ${listResult.Contents.length} objects:`);
      listResult.Contents.forEach(obj => {
        console.log(`   - ${obj.Key} (${obj.Size} bytes)`);
      });
    } else {
      console.log('⚠️  No objects found in bucket');
    }
    
    console.log('\n✅ S3 Connection Test PASSED!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Verify file is accessible at the URL above');
    console.log('   2. Backend will use same credentials for audio uploads');
    console.log('   3. ElevenLabs will generate audio → upload to S3 → Twilio plays\n');
    
  } catch (error) {
    console.error('❌ S3 Test FAILED:', error.message);
    console.error('\nPossible issues:');
    console.error('   - Bucket permissions not set correctly');
    console.error('   - IAM user needs S3FullAccess policy');
    console.error('   - Bucket name incorrect');
    process.exit(1);
  }
}

testS3();
