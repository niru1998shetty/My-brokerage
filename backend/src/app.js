const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const customerRoutes = require('./routes/customerRoutes');
const requestTypeRoutes = require('./routes/requestTypeRoutes');

const app = express();

// ─── Global Middleware ───────────────────────────────────

// CORS — allow React Vite frontend
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((u) => u.trim())
  : ['https://my-brokerage.vercel.app', 'http://localhost:5173', 'http://localhost:5174'];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiting on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Routes ──────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'API is running' });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/request-types', requestTypeRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;