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
  const [nameError, setNameError] = useState<string | null>(null);
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
      .then(async res => {
        if (!res.ok) {
          // Try to parse JSON error response
          try {
            const data = await res.json();
            throw new Error(data.error || `Failed to fetch polygons: ${res.status} ${res.statusText}`);
          } catch (parseError) {
            // If JSON parsing fails, it's likely an HTML error page
            throw new Error(`Backend server is not available. Please ensure the backend is running.`);
          }
        }
        const data = await res.json();
        return data;
      })
      .then(data => {
        setPolygons(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to load polygons. Please try again.');
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

  // Validation functions
  const validateName = (name: string): string | null => {
    if (!name || name.trim().length === 0) {
      return 'Polygon name is required';
    }
    if (name.trim().length > 100) {
      return 'Polygon name cannot exceed 100 characters';
    }
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(name.trim())) {
      return 'Polygon name can only contain letters, numbers, spaces, hyphens, and underscores';
    }
    return null;
  };

  const validatePoints = (points: Point[]): string | null => {
    if (points.length < 3) {
      return 'Polygon must have at least 3 points';
    }
    if (points.length > 100) {
      return 'Polygon cannot have more than 100 points';
    }
    return null;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    const error = validateName(value);
    setNameError(error);
  };

  const handleSave = () => {
    // Clear previous errors
    setError(null);
    setNameError(null);

    // Validate name
    const nameValidationError = validateName(name);
    if (nameValidationError) {
      setNameError(nameValidationError);
      return;
    }

    // Validate points
    const pointsValidationError = validatePoints(points);
    if (pointsValidationError) {
      setError(pointsValidationError);
      return;
    }

    setIsSaving(true);
    fetch(`${API_BASE_URL}/api/polygons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), points })
    })
      .then(async res => {
        if (!res.ok) {
          // Try to parse JSON error response
          try {
            const data = await res.json();
            throw new Error(data.error || `Failed to save polygon: ${res.status} ${res.statusText}`);
          } catch (parseError) {
            // If JSON parsing fails, it's likely an HTML error page
            throw new Error(`Backend server is not available. Please ensure the backend is running.`);
          }
        }
        const data = await res.json();
        return data;
      })
      .then(data => {
        setPolygons([...polygons, data]);
        setName('');
        setPoints([]);
        setIsSaving(false);
      })
      .catch(err => {
        console.error('Save error:', err);
        setError(err.message || 'Failed to save polygon. Please try again.');
        setIsSaving(false);
      });
  };

  const handleDelete = (id: string) => {
    setDeletingIds(prev => new Set(prev).add(id));
    setError(null);
    fetch(`${API_BASE_URL}/api/polygons/${id}`, { method: 'DELETE' })
      .then(async res => {
        if (!res.ok) {
          // Try to parse JSON error response
          try {
            const data = await res.json();
            throw new Error(data.error || `Failed to delete polygon: ${res.status} ${res.statusText}`);
          } catch (parseError) {
            // If JSON parsing fails, it's likely an HTML error page
            throw new Error(`Backend server is not available. Please ensure the backend is running.`);
          }
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
        setError(err.message || 'Failed to delete polygon. Please try again.');
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
                <div className="input-wrapper">
                  <input
                    type="text"
                    className={`input-field ${nameError ? 'input-error' : ''}`}
                    placeholder="Enter polygon name..."
                    value={name}
                    onChange={handleNameChange}
                  />
                  {nameError && (
                    <div className="input-error-message">{nameError}</div>
                  )}
                </div>
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