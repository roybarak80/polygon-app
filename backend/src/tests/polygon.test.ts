import supertest from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import Polygon from '../models/polygon';

const request = supertest(app);

async function connectWithRetry(maxRetries = 5, delay = 2000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            await mongoose.connect('mongodb://mongodb:27017/polygon-db-test', {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            } as any);
            console.log('Successfully connected to MongoDB for tests');
            return;
        } catch (error: any) { // Explicitly type error as 'any'
            console.log(`Connection attempt ${i + 1} failed: ${(error as Error).message}`);
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw new Error('Failed to connect to MongoDB after retries');
}

describe('Polygon API', () => {
    beforeAll(async () => {
        // Use the existing connection or connect to test database
        if (mongoose.connection.readyState === 0) {
            await connectWithRetry();
        }
        await Polygon.deleteMany({});
    }, 40000); // Timeout 40s

    afterAll(async () => {
        await mongoose.connection.close();
    }, 40000); // Timeout 40s

    it('should create a polygon', async () => {
        const polygon = {
            name: 'Test Polygon',
            points: [[0, 0], [100, 0], [100, 100], [0, 100]],
        };
        const response = await request.post('/api/polygons').send(polygon);
        expect(response.status).toBe(201);
        expect(response.body.name).toBe(polygon.name);
        expect(response.body.points).toHaveLength(4);
    }, 20000); // Timeout 20s

    it('should get all polygons', async () => {
        await Polygon.create({
            name: 'Test Polygon',
            points: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }],
        });
        const response = await request.get('/api/polygons');
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    }, 20000); // Timeout 20s

    it('should delete a polygon', async () => {
        const polygon = await Polygon.create({
            name: 'Test Polygon',
            points: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }],
        });
        const response = await request.delete(`/api/polygons/${polygon._id}`);
        expect(response.status).toBe(204);
    }, 20000); // Timeout 20s
});