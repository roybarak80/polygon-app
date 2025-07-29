import express from 'express';
import mongoose from 'mongoose';
import polygonRoutes from './routes/polygonRoutes';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/polygons', polygonRoutes);

// Set strictQuery to suppress deprecation warning
mongoose.set('strictQuery', false);

// Use mongodb service for Docker tests, localhost for local development
const mongoUri = process.env.NODE_ENV === 'test'
    ? 'mongodb://mongodb:27017/polygon-db-test'
    : process.env.NODE_ENV === 'development'
    ? 'mongodb://localhost:27017/polygon-db'
    : 'mongodb://mongodb:27017/polygon-db';

// Only connect if not already connected
if (mongoose.connection.readyState === 0) {
    mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    } as any);
}

export default app;