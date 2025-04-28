const express = require('express');
const cors = require('cors');
const session = require('express-session'); // Add this
const { syncModels } = require('./model');
const companyRoutes = require('./Routes/CompanyRoutes');
const userRoutes = require('./Routes/userRoutes');
const accountRoutes = require('./Routes/accountRoutes');
const productCatRoutes = require('./Routes/productCatRoutes');
const productRoutes = require('./Routes/productRoutes');
const purchaseRoutes = require('./Routes/purchaseRoutes');
const saleRoutes = require('./Routes/saleRoutes');
const productGroupRoutes = require('./Routes/productGroupRoutes');
const supplierProductRoutes = require('./Routes/SupplierProductsRoutes');
const paymentRoutes = require('./Routes/paymentRoutes');
const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use(
  session({
    secret: 'key@123', // Replace with a secure key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // set true for HTTPS
  })
);

// Routes
app.use('/api/company', companyRoutes);
app.use('/api/Users', userRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/product-category', productCatRoutes);
app.use('/api/product', productRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/sale', saleRoutes);
app.use('/api/product-group', productGroupRoutes);
app.use('/api/supplier-product', supplierProductRoutes);
app.use('/api/payment', paymentRoutes);
// Sync Models
syncModels();

// Test Route
app.get('/', (req, res) => {
  res.send('Hello from Node.js Backend!');
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
