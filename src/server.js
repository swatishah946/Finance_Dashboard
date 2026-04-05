import 'dotenv/config';
import app from './app.js';
import { initializeDatabase, closeDatabase } from './db/index.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await initializeDatabase();
    console.log('[DB] SQLite Database connected and relationships synced');

    const server = app.listen(PORT, () => {
      console.log(`[SERVER] API is actively running on http://localhost:${PORT}`);
      console.log(`[SERVER] Environment: ${process.env.NODE_ENV}`);
    });

    // Graceful Shutdown configurations
    const gracefulShutdown = async (signal) => {
      console.log(`\n[${signal}] Signal received. Shutting down gracefully.`);
      server.close(async () => {
        console.log('[SERVER] HTTP server closed.');
        try {
          await closeDatabase();
          console.log('[DB] Database connections closed.');
          process.exit(0);
        } catch (err) {
          console.error('[DB] Error during disconnection', err);
          process.exit(1);
        }
      });

      // Force shutdown if it takes too long (10 seconds)
      setTimeout(() => {
        console.error('[SERVER] Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  } catch (error) {
    console.error('[INIT FAILED] Cannot start server:', error.message);
    process.exit(1);
  }
};

startServer();
