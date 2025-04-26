const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { syncModels } = require('./model');
const companyRoutes = require('./Routes/CompanyRoutes');
const userRoutes = require('./Routes/userRoutes');
const accountRoutes = require('./Routes/accountRoutes');

const app = express();
const PORT = 5000;

// Enhanced CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: 'key@123',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false, // Set to true if using HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    }
  })
);

// Database connection
const { sequelize } = require('./model');
sequelize.authenticate()
  .then(() => console.log('✅ Database connected successfully'))
  .catch(err => console.error('❌ Database connection error:', err));

// Routes
app.use('/api/company', companyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/accounts', accountRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  syncModels();
});