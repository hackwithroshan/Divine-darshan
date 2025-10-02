const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Load env vars
dotenv.config();

// --- START OF FIX: Add comprehensive startup check for all required environment variables ---
const requiredEnvVars = ['JWT_SECRET', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'MONGO_URI', 'FRONTEND_URL'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('\n\n--- FATAL ERROR: Missing Required Environment Variables ---');
    console.error('The backend server cannot start because the following variables are not defined:');
    missingVars.forEach(varName => console.error(`  - ${varName}`));
    console.error('\nPlease check your ".env" file (for local development) or your Vercel Project Settings (for deployment).');
    console.error('See backend/README.md for more details on setting up environment variables.\n\n');
    process.exit(1);
}
// --- END OF FIX ---

// Connect to database
connectDB();

// Route files
const authRoutes = require('./routes/authRoutes');
const templeRoutes = require('./routes/templeRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const contentRoutes = require('./routes/contentRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const userRoutes = require('./routes/userRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const queueAssistanceRoutes = require('./routes/queueAssistanceRoutes');


const app = express();

// Body parser
app.use(express.json());

// --- START OF FIX: Explicit CORS Configuration ---
// Enable CORS with specific options to allow requests from the frontend.
// The frontend URL is specified in the .env file (for local) or Vercel env vars (for production).
const corsOptions = {
    origin: process.env.FRONTEND_URL,
    optionsSuccessStatus: 200 // For legacy browser support
};
app.use(cors(corsOptions));
// --- END OF FIX ---

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/temples', templeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/queue-assistance', queueAssistanceRoutes);


// Error Handler Middleware (must be after mounting routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// This block is for local development. Vercel will only import `app`.
if (require.main === module) {
  const server = app.listen(PORT, () =>
    console.log(`✅ Backend server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
  );

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err, promise) => {
    console.error(`❌ Unhandled Rejection: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
  });
}

// Vercel handles the server listening part, so we export the app
module.exports = app;