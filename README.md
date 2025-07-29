# Polygon Drawing App

A simple web application for drawing, saving, and managing custom polygons on an interactive canvas. Built with React, TypeScript, and Express.js.

## Features

- **Interactive Canvas**: Click to create polygon points
- **Polygon Management**: Save, view, and delete polygons
- **Modern UI**: Clean, responsive design with animations
- **Real-time Feedback**: Loading states and visual feedback
- **Docker Support**: Easy deployment with Docker Compose

## Quick Start

### Prerequisites

- Docker and Docker Compose installed on your machine

### Installation

1. Clone the repository:
```bash
git clone https://github.com/roybarak80/polygon-app.git
cd polygon-app
```

2. Start the application:
```bash
docker-compose up --build
```

3. Open your browser and navigate to:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:3001

## How to Use

1. **Draw a Polygon**: Click on the canvas to create polygon points
2. **Name Your Polygon**: Enter a name in the input field
3. **Save**: Click "Save Polygon" to store it
4. **Manage**: View and delete existing polygons from the list

## Tech Stack

- **Frontend**: React, TypeScript, SCSS
- **Backend**: Express.js, TypeScript, MongoDB
- **Database**: MongoDB
- **Containerization**: Docker, Docker Compose
- **Testing**: Jest, React Testing Library

## Development

The app is organized into separate frontend and backend services:

- `frontend/` - React application with TypeScript
- `backend/` - Express.js API server
- `docker-compose.yml` - Multi-service Docker setup

### Running Tests

For development, you can run tests locally:

```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test
```
