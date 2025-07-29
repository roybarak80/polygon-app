import { Request, Response } from 'express';
import Polygon, { IPolygon } from '../models/polygon';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Validation functions
const validatePolygonName = (name: string): string | null => {
  if (!name || typeof name !== 'string') {
    return 'Polygon name is required and must be a string';
  }
  if (name.trim().length === 0) {
    return 'Polygon name cannot be empty';
  }
  if (name.trim().length > 100) {
    return 'Polygon name cannot exceed 100 characters';
  }
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(name.trim())) {
    return 'Polygon name can only contain letters, numbers, spaces, hyphens, and underscores';
  }
  return null;
};

const validatePoints = (points: any[]): string | null => {
  if (!Array.isArray(points)) {
    return 'Points must be an array';
  }
  if (points.length < 3) {
    return 'Polygon must have at least 3 points';
  }
  if (points.length > 100) {
    return 'Polygon cannot have more than 100 points';
  }

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    if (!point || typeof point !== 'object') {
      return `Point ${i + 1} must be an object`;
    }
    if (typeof point.x !== 'number' || typeof point.y !== 'number') {
      return `Point ${i + 1} must have numeric x and y coordinates`;
    }
    if (!isFinite(point.x) || !isFinite(point.y)) {
      return `Point ${i + 1} coordinates must be finite numbers`;
    }
    if (point.x < 0 || point.y < 0 || point.x > 800 || point.y > 600) {
      return `Point ${i + 1} coordinates must be within canvas bounds (0-800, 0-600)`;
    }
  }

  return null;
};

const validatePolygonId = (id: string): string | null => {
  if (!id || typeof id !== 'string') {
    return 'Polygon ID is required';
  }
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return 'Invalid polygon ID format';
  }
  return null;
};

export const createPolygon = async (req: Request, res: Response) => {
    try {
        const { name, points } = req.body;

        // Validate name
        const nameError = validatePolygonName(name);
        if (nameError) {
            return res.status(400).json({ 
                message: 'Validation error', 
                error: nameError 
            });
        }

        // Validate points
        const pointsError = validatePoints(points);
        if (pointsError) {
            return res.status(400).json({ 
                message: 'Validation error', 
                error: pointsError 
            });
        }

        // Check for duplicate names
        const existingPolygon = await Polygon.findOne({ name: name.trim() });
        if (existingPolygon) {
            return res.status(409).json({ 
                message: 'Validation error', 
                error: 'A polygon with this name already exists' 
            });
        }

        await sleep(5000);
        const polygon = new Polygon({ 
            name: name.trim(), 
            points: points.map((p: any) => ({ x: p.x, y: p.y }))
        });
        await polygon.save();
        res.status(201).json(polygon);
    } catch (error: any) {
        console.error('Create polygon error:', error);
        res.status(500).json({ 
            message: 'Error creating polygon', 
            error: 'Internal server error' 
        });
    }
};

export const deletePolygon = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Validate ID
        const idError = validatePolygonId(id);
        if (idError) {
            return res.status(400).json({ 
                message: 'Validation error', 
                error: idError 
            });
        }

        // Check if polygon exists
        const polygon = await Polygon.findById(id);
        if (!polygon) {
            return res.status(404).json({ 
                message: 'Validation error', 
                error: 'Polygon not found' 
            });
        }

        await sleep(5000);
        await Polygon.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error: any) {
        console.error('Delete polygon error:', error);
        res.status(500).json({ 
            message: 'Error deleting polygon', 
            error: 'Internal server error' 
        });
    }
};

export const getPolygons = async (req: Request, res: Response) => {
    try {
        await sleep(5000);
        const polygons = await Polygon.find().sort({ createdAt: -1 });
        res.json(polygons.map(p => ({
            id: p._id,
            name: p.name,
            points: p.points
        })));
    } catch (error: any) {
        console.error('Get polygons error:', error);
        res.status(500).json({ 
            message: 'Error fetching polygons', 
            error: 'Internal server error' 
        });
    }
};