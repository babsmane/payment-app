const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const paymentRoutes = require('./routes/payments');
const { swaggerUi, specs } = require('./swagger');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

module.exports = app;
