import app from './app';
import { connectDB } from './config/db';

const PORT = process.env.PORT || 5000;

// Wait for database initialization so registrations cannot race the memory fallback.
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Clinical Lab Backend API Server running on port ${PORT}`);
  });
});
