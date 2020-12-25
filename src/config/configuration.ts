export default () => ({
  app: {
    environment: process.env.NODE_ENV || 'development',
    encryption_key: process.env.SERVER_SECRET || 'AppSecret',
  },
  service: {
    serviceName: 'Todo Service',
    port: 3010,
    host: 'http://localhost:3010',
    url: `http://localhost:3010`,
    version: 1,
    lang: 'en',
    pagination: {
      itemsPerPage: 10,
    },
    mongodb: {
      url: process.env.DB_URL,
      test: process.env.DB_TEST_URL,
    },
    gcs: {
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFile: process.env.GOOGLE_CLOUD_KEYFILE,
      bucket: process.env.GOOGLE_CLOUD_STORAGE_BUCKET,
    },
    s3: {
      key: process.env.AWS_ACCESS_KEY,
      secret: process.env.AWS_SECRET_KEY,
      bucket: process.env.AWS_BUCKET,
      region: process.env.AWS_REGION,
    },
  },
});
