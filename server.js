const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // ✅ Import cors
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const createSuperAdmin = require('./utils/createSuperAdmin');

dotenv.config();
connectDB();

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CORS: allow requests from any origin (adjust origin for production)
app.use(cors({
  origin: '*', // allow all origins (development)
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// ✅ Optional: basic logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Create super admin if not exists
createSuperAdmin();

// Routes
app.use('/api/auth', authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ success: false, message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server error:', err.message);
});
