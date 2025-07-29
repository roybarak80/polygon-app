import express from 'express';
import { createPolygon, deletePolygon, getPolygons } from '../controllers/polygonController';

const router = express.Router();

router.post('/', createPolygon);
router.delete('/:id', deletePolygon);
router.get('/', getPolygons);

export default router;