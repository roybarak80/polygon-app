import { Request, Response } from 'express';
import Polygon, { IPolygon } from '../models/polygon';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const createPolygon = async (req: Request, res: Response) => {
    try {
        await sleep(5000);
        const { name, points } = req.body;
        // Transform points from [[x, y]] to [{ x, y }]
        const formattedPoints = points.map(([x, y]: [number, number]) => ({ x, y }));
        const polygon = new Polygon({ name, points: formattedPoints });
        await polygon.save();
        res.status(201).json(polygon);
    } catch (error: any) {
        console.error('Error creating polygon:', error);
        res.status(500).json({ message: 'Error creating polygon', error: error.message });
    }
};

export const deletePolygon = async (req: Request, res: Response) => {
    try {
        await sleep(5000);
        const { id } = req.params;
        await Polygon.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error: any) {
        console.error('Error deleting polygon:', error);
        res.status(500).json({ message: 'Error deleting polygon', error: error.message });
    }
};

export const getPolygons = async (req: Request, res: Response) => {
    try {
        await sleep(5000);
        const polygons = await Polygon.find();
        res.json(polygons.map((p: IPolygon) => ({
            id: p._id,
            name: p.name,
            points: p.points.map((pt: { x: number; y: number }) => [pt.x, pt.y])
        })));
    } catch (error: any) {
        console.error('Error fetching polygons:', error);
        res.status(500).json({ message: 'Error fetching polygons', error: error.message });
    }
};