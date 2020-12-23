export default () => ({
  app: {
    environment: process.env.NODE_ENV || 'development',
    encryption_key: process.env.SERVER_SECRET || 'AppSecret',
  },
  services: {
    todo: {
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
    },
  },
});
