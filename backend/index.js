const { startServer } = require('./server.js');
const path = require('path');

// Local dev database
const dbPath = path.join(__dirname, 'database.sqlite');

startServer(dbPath).then(() => {
  console.log('Backend server manually started for Browser access.');
}).catch(err => {
  console.error('Failed to start server:', err);
});
