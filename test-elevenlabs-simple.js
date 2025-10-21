const ElevenLabsService = require('./backend/src/services/elevenlabs');
const StorageService = require('./backend/src/services/storage');

// Set environment variables
process.env.ELEVENLABS_API_KEY = 'sk_64074dffc99f855fad4b1a06681130e1c3769512e4dd5b2d';
process.env.AWS_S3_BUCKET = 'globalvoice-audio';
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_ACCESS_KEY_ID = 'AKIAYBNQ2TY3FWYRJFDG';
process.env.AWS_SECRET_ACCESS_KEY = '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';

async function test() {
  console.log('🎙️  ElevenLabs + S3 Integration Test\n');
  
  const elevenlabs = new ElevenLabsService();
  const storage = new StorageService();
  
  console.log(`ElevenLabs: ${elevenlabs.isEnabled() ? '✅' : '❌'}`);
  console.log(`S3 Storage: ${storage.isEnabled() ? '✅' : '❌'}\n`);
  
  if (!elevenlabs.isEnabled() || !storage.isEnabled()) {
    console.log('❌ Services not enabled');
    return;
  }
  
  // Generate audio
  console.log('Generating audio with voice "rachel"...');
  const text = 'Hello! This is a test of ElevenLabs premium voice. How natural does this sound?';
  const audioBuffer = await elevenlabs.textToSpeech(text, 'rachel');
  console.log(`✅ Generated: ${audioBuffer.length} bytes\n`);
  
  // Upload to S3
  console.log('Uploading to S3...');
  const url = await storage.uploadAudio(audioBuffer, 'audio/mpeg');
  console.log(`✅ Uploaded: ${url}\n`);
  
  // Test URL
  console.log('Testing URL accessibility...');
  const response = await fetch(url);
  console.log(`✅ Accessible: ${response.status} ${response.statusText}`);
  console.log(`   Size: ${response.headers.get('content-length')} bytes\n`);
  
  console.log('🎉 SUCCESS! ElevenLabs + S3 working perfectly!');
  console.log(`\n📞 Now call +1 (817) 541-7385 to hear it live!`);
}

test().catch(console.error);
