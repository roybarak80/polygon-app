import React from 'react';
import PolygonCanvas from './components/PolygonCanvas';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold mb-4">Polygon Editor</h1>
      <PolygonCanvas />
    </div>
  );
};

export default App;