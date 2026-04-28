const { Storage } = require('@google-cloud/storage');

async function setupCors() {
  const storage = new Storage({
    projectId: 'rental-shield-a4638',
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
  });

  const bucketName = 'rental-shield-a4638.appspot.com';
  const bucket = storage.bucket(bucketName);

  const corsConfiguration = [
    {
      origin: ['https://rental-shield-a4638.web.app', 'http://localhost:5173', 'http://localhost:5174'],
      method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      maxAgeSeconds: 3600,
      responseHeader: ['Content-Type', 'Authorization', 'Content-Length', 'User-Agent', 'X-Requested-With']
    }
  ];

  try {
    await bucket.setCorsConfiguration(corsConfiguration);
    console.log('CORS configuration updated successfully!');
    console.log('Allowed origins:', corsConfiguration[0].origin);
  } catch (error) {
    console.error('Error setting CORS:', error);
  }
}

setupCors();
