import { Request, Response } from 'express';
import Polygon, { IPolygon } from '../models/polygon';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const createPolygon = async (req: Request, res: Response) => {
    try {
        await sleep(5000);
        const { name, points } = req.body;
        const polygon = new Polygon({ name, points });
        await polygon.save();
        res.status(201).json(polygon);
    } catch (error: any) {
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
        res.status(500).json({ message: 'Error deleting polygon', error: error.message });
    }
};

export const getPolygons = async (req: Request, res: Response) => {
    try {
        await sleep(5000);
        const polygons = await Polygon.find();
        res.json(polygons.map(p => ({
            id: p._id,
            name: p.name,
            points: p.points
        })));
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching polygons', error: error.message });
    }
};