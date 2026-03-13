import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import authRoutes from './routes/auth.js';
import ipRoutes from './routes/ips.js';
import scanRoutes from './routes/scans.js';
import alertRoutes from './routes/alerts.js';

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL
});
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ips', ipRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/alerts', alertRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export { prisma };
