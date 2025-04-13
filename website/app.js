const path = require('path');

require('apostrophe')({
  shortName: 'apostrophe-site',
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  
  // MongoDB connection string
  mongo: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/apostrophe'
  },
  
  // Session configuration 
  modules: {
    // Core modules configuration
    '@apostrophecms/express': {
      options: {
        session: {
          // If using Redis (recommended for production)
          secret: process.env.SESSION_SECRET || 'changeme',
          store: process.env.REDIS_URI ? {
            connect: require('connect-redis'),
            options: {
              url: process.env.REDIS_URI || 'redis://localhost:6379'
            }
          } : {}
        }
      }
    },
    
    // Configure page types
    '@apostrophecms/page': {
      options: {
        types: [
          {
            name: 'default-page',
            label: 'Default'
          },
          {
            name: 'home-page',
            label: 'Home'
          }
        ]
      }
    },

    // Project page types
    'default-page': {},
    'home-page': {}
  }
}); 