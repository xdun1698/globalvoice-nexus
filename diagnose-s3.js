const { S3Client, PutObjectCommand, GetBucketPolicyCommand, GetBucketCorsCommand } = require('./backend/node_modules/@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'AKIAYBNQ2TY3FWYRJFDG',
    secretAccessKey: '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'
  }
});

const bucket = 'globalvoice-audio';

async function diagnose() {
  console.log('🔍 S3 Bucket Diagnosis\n');
  console.log(`Bucket: ${bucket}`);
  console.log(`Region: us-east-1`);
  console.log(`Access Key: AKIAYBNQ2TY3FWYRJFDG\n`);
  
  // Test 1: Check bucket policy
  console.log('1️⃣ Checking bucket policy...');
  try {
    const policy = await s3Client.send(new GetBucketPolicyCommand({ Bucket: bucket }));
    console.log('✅ Bucket policy exists');
    console.log(JSON.stringify(JSON.parse(policy.Policy), null, 2));
  } catch (error) {
    if (error.name === 'NoSuchBucketPolicy') {
      console.log('⚠️  No bucket policy set - need to add public read policy');
    } else {
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  // Test 2: Check CORS
  console.log('\n2️⃣ Checking CORS configuration...');
  try {
    const cors = await s3Client.send(new GetBucketCorsCommand({ Bucket: bucket }));
    console.log('✅ CORS configured');
    console.log(JSON.stringify(cors.CORSRules, null, 2));
  } catch (error) {
    if (error.name === 'NoSuchCORSConfiguration') {
      console.log('⚠️  No CORS configuration - need to add for Twilio access');
    } else {
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  // Test 3: Try to upload
  console.log('\n3️⃣ Testing file upload...');
  try {
    const key = `audio/elevenlabs/test-${Date.now()}.mp3`;
    await s3Client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: 'test audio content',
      ContentType: 'audio/mpeg'
    }));
    console.log(`✅ Upload successful!`);
    console.log(`   Key: ${key}`);
    console.log(`   URL: https://${bucket}.s3.us-east-1.amazonaws.com/${key}`);
  } catch (error) {
    console.log(`❌ Upload failed: ${error.message}`);
    console.log(`   Code: ${error.Code || error.name}`);
  }
  
  console.log('\n📋 Summary:');
  console.log('   If upload succeeded: S3 is working, just need bucket policy + CORS');
  console.log('   If upload failed: Check IAM user permissions');
}

diagnose().catch(console.error);
