import mongoose, { Schema, Document } from 'mongoose';

export interface Point {
    x: number;
    y: number;
}

export interface IPolygon extends Document {
    name: string;
    points: Point[];
}

const PolygonSchema: Schema = new Schema({
    name: { type: String, required: true },
    points: [{ x: { type: Number, required: true }, y: { type: Number, required: true } }],
});

export default mongoose.model<IPolygon>('Polygon', PolygonSchema);