const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.get('/test', (req, res) => {
    console.log('✅ Test route hit');
    res.send('Test route works!');
  });

const PORT = process.env.PORT || 50001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  }).on('error', (err) => {
    console.log('Server error:', err.message);
  });