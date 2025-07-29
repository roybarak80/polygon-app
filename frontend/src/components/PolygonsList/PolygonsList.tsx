import React from 'react';
import './PolygonsList.scss';

interface Point {
  x: number;
  y: number;
}

interface Polygon {
  id: string;
  name: string;
  points: Point[];
}

interface PolygonsListProps {
  polygons: Polygon[];
  deletingIds: Set<string>;
  onDelete: (id: string) => void;
}

const PolygonsList: React.FC<PolygonsListProps> = ({ polygons, deletingIds, onDelete }) => {
  return (
    <div className="polygons-section">
      <h2 className="section-title">Existing Polygons</h2>
      <ul className="polygons-list">
        {polygons.map(polygon => (
          <li key={polygon.id} className="polygon-item">
            <span className="polygon-name">{polygon.name}</span>
            <button 
              onClick={() => onDelete(polygon.id)}
              className={`delete-button ${deletingIds.has(polygon.id) ? 'deleting' : ''}`}
              disabled={deletingIds.has(polygon.id)}
            >
              {deletingIds.has(polygon.id) ? 'Deleting...' : 'Delete'}
            </button>
          </li>
        ))}
        {polygons.length === 0 && (
          <li className="empty-state">
            No polygons created yet. Start drawing to create your first polygon!
          </li>
        )}
      </ul>
    </div>
  );
};

export default PolygonsList; 