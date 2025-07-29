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
    name: { 
        type: String, 
        required: [true, 'Polygon name is required'],
        trim: true,
        minlength: [1, 'Polygon name cannot be empty'],
        maxlength: [100, 'Polygon name cannot exceed 100 characters'],
        match: [/^[a-zA-Z0-9\s\-_]+$/, 'Polygon name can only contain letters, numbers, spaces, hyphens, and underscores']
    },
    points: [{ 
        x: { 
            type: Number, 
            required: [true, 'Point x coordinate is required'],
            min: [0, 'X coordinate must be non-negative'],
            max: [800, 'X coordinate must be within canvas bounds']
        }, 
        y: { 
            type: Number, 
            required: [true, 'Point y coordinate is required'],
            min: [0, 'Y coordinate must be non-negative'],
            max: [600, 'Y coordinate must be within canvas bounds']
        } 
    }],
}, {
    timestamps: true,
    validateBeforeSave: true
});

// Ensure at least 3 points
PolygonSchema.pre('save', function(next) {
    if (this.points.length < 3) {
        return next(new Error('Polygon must have at least 3 points'));
    }
    next();
});

export default mongoose.model<IPolygon>('Polygon', PolygonSchema);