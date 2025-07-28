import mongoose, { Schema } from 'mongoose';

export interface IPolygon extends mongoose.Document {
    name: string;
    points: { x: number; y: number }[];
}

const PointSchema = new Schema({
    x: { type: Number, required: true },
    y: { type: Number, required: true },
});

const PolygonSchema = new Schema({
    name: { type: String, required: true },
    points: [PointSchema],
});

export default mongoose.model<IPolygon>('Polygon', PolygonSchema);