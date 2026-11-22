const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('node:path');
const { existsSync } = require('node:fs');
const connectDB = require('./config/db');

dotenv.config({ quiet: true });

const app = express();
const PORT = process.env.PORT || 5000;
const production = process.env.NODE_ENV === 'production';
const trustProxyHops = process.env.TRUST_PROXY_HOPS;
if (trustProxyHops !== undefined) {
  if (!/^[1-9]\d?$/.test(trustProxyHops)) throw new Error('TRUST_PROXY_HOPS must be an integer from 1 to 99');
  app.set('trust proxy', Number(trustProxyHops));
}

const clientOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet({ contentSecurityPolicy: { directives: {
  imgSrc: ["'self'", 'data:', 'https:'],
  upgradeInsecureRequests: production ? [] : null,
} } }));
app.use(cors({
  origin(origin, callback) {
    callback(null, Boolean(origin && clientOrigins.includes(origin)));
  },
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(production ? ':method :status :response-time ms' : 'dev'));

app.get('/api/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'degraded',
    db: connected ? 'connected' : 'disconnected',
  });
});

app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

const frontend = path.resolve(__dirname, '../local-store-frontend/build');
const frontendIndex = path.join(frontend, 'index.html');
if (production && existsSync(frontendIndex)) {
  app.use(express.static(frontend, { index: false }));
  app.get('/{*route}', (req, res, next) => {
    if (path.extname(req.path) || !req.accepts('html')) return next();
    res.sendFile(frontendIndex, { headers: { 'Cache-Control': 'no-cache' } });
  });
}

app.use((req, res) => res.status(404).json({ message: 'Resource not found' }));
app.use(require('./middleware/errorHandler'));

const start = async () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error('JWT_SECRET must be a random string of at least 32 characters');
    process.exit(1);
  }

  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    const shutdown = () => {
      setTimeout(() => process.exit(1), 10000).unref();
      server.close(async () => {
        try {
          await mongoose.disconnect();
        } catch {
          process.exitCode = 1;
        }
      });
    };
    process.once('SIGTERM', shutdown);
    process.once('SIGINT', shutdown);
  } catch (error) {
    console.error(`Server failed to start (${error.code || error.name}). Check MongoDB configuration and connectivity.`);
    process.exit(1);
  }
};

if (require.main === module) start();

module.exports = app;
