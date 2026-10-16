require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const app = require('./app');
const connectDB = require('./config/db');
const { initEmail } = require('./config/email');

const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Initialize email transport
  initEmail();

  // Create and start HTTP server
  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`\n🚀 Safe Tag server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`   Server:  http://localhost:${PORT}`);
    console.log(`   Health:  http://localhost:${PORT}/api/health\n`);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Unhandled rejections
  process.on('unhandledRejection', (reason) => {
    console.error('UNHANDLED REJECTION:', reason);
    server.close(() => process.exit(1));
  });
};

startServer();
