import React, { useState, useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
}

interface Polygon {
  id: string;
  name: string;
  points: Point[];
}

const PolygonCanvas: React.FC = () => {
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const [name, setName] = useState('');
  const [points, setPoints] = useState<Point[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawPolygons = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.src = 'https://picsum.photos/1920/1080';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      drawPolygonShapes();
    };

    drawPolygonShapes();
  };

  const drawPolygonShapes = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    polygons.forEach(polygon => {
      if (polygon.points && polygon.points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(polygon.points[0].x, polygon.points[0].y);
        polygon.points.forEach(point => ctx.lineTo(point.x, point.y));
        ctx.closePath();
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = 'rgba(0, 0, 255, 0.1)';
        ctx.fill();
      }
    });

    if (points.length > 0) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.forEach(point => ctx.lineTo(point.x, point.y));
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  useEffect(() => {
    fetch('http://localhost:3001/api/polygons')
      .then(res => res.json())
      .then(data => setPolygons(data))
      .catch(err => console.error('Fetch error:', err));

    drawPolygons();
  }, []);

  useEffect(() => {
    drawPolygons();
  }, [points, polygons]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPoints([...points, { x, y }]);
  };

  const handleSave = () => {
    if (name && points.length >= 3) {
      fetch('http://localhost:3001/api/polygons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, points })
      })
        .then(res => res.json())
        .then(data => {
          setPolygons([...polygons, data]);
          setName('');
          setPoints([]);
        })
        .catch(err => console.error('Save error:', err));
    }
  };

  const handleDelete = (id: string) => {
    fetch(`http://localhost:3001/api/polygons/${id}`, { method: 'DELETE' })
      .then(() => setPolygons(polygons.filter(p => p.id !== p.id)))
      .catch(err => console.error('Delete error:', err));
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          className="border p-2 rounded"
          placeholder="Polygon name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={!name || points.length < 3}
          onClick={handleSave}
        >
          Save Polygon
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="border"
        width={800}
        height={600}
        onClick={handleCanvasClick}
      />
      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2">Existing Polygons</h2>
        <ul>
          {polygons.map(polygon => (
            <li key={polygon.id}>
              {polygon.name}
              <button onClick={() => handleDelete(polygon.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PolygonCanvas;