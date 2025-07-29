import React, { useState, useEffect, useRef } from 'react';
import Header from '../Header';
import SideMenu from '../SideMenu';
import PolygonsList from '../PolygonsList';
import { API_BASE_URL } from '../../config';
import './PolygonCanvas.scss';

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
  const [isLoading, setIsLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Preload background image
  useEffect(() => {
    const img = new Image();
    img.src = 'https://picsum.photos/1920/1080';
    img.onload = () => {
      imageRef.current = img;
      drawPolygons();
    };
  }, []);

  const drawPolygons = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background image if loaded
    if (imageRef.current) {
      ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
    }

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

  // Fetch polygons on mount
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/api/polygons`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch polygons: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        setPolygons(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setError('Failed to load polygons. Please try again.');
        setIsLoading(false);
      });
  }, []);

  // Redraw canvas when points or polygons change
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
      setIsSaving(true);
      setError(null);
      fetch(`${API_BASE_URL}/api/polygons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, points })
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to save polygon: ${res.status} ${res.statusText}`);
          }
          return res.json();
        })
        .then(data => {
          setPolygons([...polygons, data]);
          setName('');
          setPoints([]);
          setIsSaving(false);
        })
        .catch(err => {
          console.error('Save error:', err);
          setError('Failed to save polygon. Please try again.');
          setIsSaving(false);
        });
    }
  };

  const handleDelete = (id: string) => {
    setDeletingIds(prev => new Set(prev).add(id));
    setError(null);
    fetch(`${API_BASE_URL}/api/polygons/${id}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to delete polygon: ${res.status} ${res.statusText}`);
        }
        setPolygons(polygons.filter(p => p.id !== id));
        setDeletingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      })
      .catch(err => {
        console.error('Delete error:', err);
        setError('Failed to delete polygon. Please try again.');
        setDeletingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      });
  };

  return (
    <div className="polygon-canvas">
      <Header />
      <div className="container">
        <div className="main-content">
          <SideMenu />
          <div className="sections-wrapper">
            <div className="canvas-section">
              <div className="input-section">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter polygon name..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <button
                  className={`save-button ${isSaving ? 'saving' : ''}`}
                  disabled={!name || points.length < 3 || isSaving}
                  onClick={handleSave}
                >
                  {isSaving ? 'Saving polygon...' : 'Save Polygon'}
                </button>
              </div>
              <div className="canvas-container">
                <canvas
                  ref={canvasRef}
                  className="canvas"
                  width={800}
                  height={600}
                  onClick={handleCanvasClick}
                />
              </div>
            </div>
            
            <PolygonsList 
              polygons={polygons}
              deletingIds={deletingIds}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
      {isLoading && (
        <div className="overlay-loader">
          <div className="loader-container">
            <div className="loader"></div>
            <p className="loader-text">Loading polygons...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="overlay-error">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3 className="error-title">Error</h3>
            <p className="error-message">{error}</p>
            <button 
              className="error-close-button"
              onClick={() => setError(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolygonCanvas;