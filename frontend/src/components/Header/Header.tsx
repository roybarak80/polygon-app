import React from 'react';
import './Header.scss';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="title">
          Polygon Drawing App
        </h1>
        <p className="subtitle">
          Create and manage polygons on an interactive canvas
        </p>
      </div>
    </header>
  );
};

export default Header; 