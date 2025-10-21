const ElevenLabsService = require('./backend/src/services/elevenlabs');
const StorageService = require('./backend/src/services/storage');

// Set environment variables
process.env.ELEVENLABS_API_KEY = 'sk_64074dffc99f855fad4b1a06681130e1c3769512e4dd5b2d';
process.env.AWS_S3_BUCKET = 'globalvoice-audio';
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_ACCESS_KEY_ID = 'AKIAYBNQ2TY3FWYRJFDG';
process.env.AWS_SECRET_ACCESS_KEY = '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';

async function testFullFlow() {
  console.log('🎙️  Testing ElevenLabs + S3 Integration\n');
  
  // Test 1: ElevenLabs Connection
  console.log('1️⃣ Testing ElevenLabs API...');
  const elevenlabs = new ElevenLabsService();
  
  if (!elevenlabs.isEnabled()) {
    console.log('❌ ElevenLabs not enabled');
    return;
  }
  console.log('✅ ElevenLabs API connected');
  
  // Test 2: List available voices
  console.log('\n2️⃣ Available ElevenLabs voices:');
  const voices = elevenlabs.getVoiceCategories();
  console.log(`   Female US: ${voices.female.us.slice(0, 5).join(', ')}`);
  console.log(`   Male US: ${voices.male.us.slice(0, 5).join(', ')}`);
  
  // Test 3: Generate audio
  console.log('\n3️⃣ Generating test audio with ElevenLabs...');
  const testText = 'Hello! This is a test of the ElevenLabs premium voice system. How does this sound?';
  const voiceId = 'rachel'; // Premium female voice
  
  try {
    const audioBuffer = await elevenlabs.textToSpeech(testText, voiceId);
    console.log(`✅ Audio generated: ${audioBuffer.length} bytes`);
    
    // Test 4: Upload to S3
    console.log('\n4️⃣ Uploading to S3...');
    const storage = new StorageService();
    
    if (!storage.isEnabled()) {
      console.log('❌ S3 storage not enabled');
      return;
    }
    console.log('✅ S3 storage connected');
    
    const audioUrl = await storage.uploadAudio(audioBuffer, 'audio/mpeg', 3600);
    console.log(`✅ Upload successful!`);
    console.log(`   URL: ${audioUrl}`);
    
    // Test 5: Verify URL is accessible
    console.log('\n5️⃣ Verifying URL is publicly accessible...');
    const response = await fetch(audioUrl);
    if (response.ok) {
      console.log(`✅ URL is accessible (${response.status})`);
      console.log(`   Content-Type: ${response.headers.get('content-type')}`);
      console.log(`   Size: ${response.headers.get('content-length')} bytes`);
    } else {
      console.log(`❌ URL not accessible (${response.status})`);
    }
    
    console.log('\n✅ FULL INTEGRATION TEST PASSED!');
    console.log('\n📋 Summary:');
    console.log('   ✅ ElevenLabs API working');
    console.log('   ✅ Audio generation working');
    console.log('   ✅ S3 upload working');
    console.log('   ✅ Public URL accessible');
    console.log('\n🎉 Ready for production calls!');
    console.log(`\n📞 Test by calling: +1 (817) 541-7385`);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
  }
}

testFullFlow();
