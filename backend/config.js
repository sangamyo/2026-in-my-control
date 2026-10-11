const dotenv = require('dotenv');

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

const DEV_JWT_SECRET = 'dev-only-insecure-jwt-secret-change-me';
const DEV_CLIENT_URLS = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173'];

function fail(message) {
  console.error(`[config] FATAL: ${message}`);
  process.exit(1);
}

let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  if (isProduction) fail('JWT_SECRET must be set when NODE_ENV=production.');
  console.warn('[config] JWT_SECRET not set; using an insecure development-only secret.');
  JWT_SECRET = DEV_JWT_SECRET;
}

let MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  if (isProduction) fail('MONGO_URI must be set when NODE_ENV=production.');
  MONGO_URI = 'mongodb://localhost:27017/goaltracker';
}

// Comma-separated list of allowed browser origins, e.g.
// CLIENT_URL=https://my-app.vercel.app,https://www.example.com
const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((s) => s.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const CLIENT_URLS = isProduction
  ? configuredOrigins
  : Array.from(new Set([...configuredOrigins, ...DEV_CLIENT_URLS]));

if (isProduction && CLIENT_URLS.length === 0) {
  console.warn('[config] CLIENT_URL is not set; browser requests from other origins will be blocked by CORS.');
}

module.exports = {
  NODE_ENV,
  isProduction,
  PORT: parseInt(process.env.PORT, 10) || 4000,
  MONGO_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URLS,
};
