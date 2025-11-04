const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const createSuperAdmin = require('./utils/createSuperAdmin');


dotenv.config();
connectDB();

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

createSuperAdmin();

app.use('/api/auth', authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categorys", categoryRoutes);


const PORT = process.env.PORT || 50001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  }).on('error', (err) => {
    console.log('Server error:', err.message);
  });