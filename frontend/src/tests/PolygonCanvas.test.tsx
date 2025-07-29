import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import PolygonCanvas from '../components/PolygonCanvas';
import { API_BASE_URL } from '../config';
import '@testing-library/jest-dom';
import 'jest-canvas-mock';

const server = setupServer(
  rest.get(`${API_BASE_URL}/api/polygons`, (req, res, ctx) => {
    console.log('MSW: GET /api/polygons intercepted');
    return res(ctx.json([
      { id: '1', name: 'Test Polygon', points: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }] }
    ]));
  }),
  rest.post(`${API_BASE_URL}/api/polygons`, async (req, res, ctx) => {
    console.log('MSW: POST /api/polygons intercepted');
    const { name, points } = await req.json();
    return res(ctx.status(201), ctx.json({ id: '2', name, points }));
  }),
  rest.delete(`${API_BASE_URL}/api/polygons/:id`, (req, res, ctx) => {
    console.log('MSW: DELETE /api/polygons/:id intercepted');
    return res(ctx.status(204));
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('PolygonCanvas CRUD Tests', () => {
  it('renders canvas and input (Read readiness)', () => {
    render(<PolygonCanvas />);
    expect(screen.getByPlaceholderText('Enter polygon name...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save polygon/i })).toBeInTheDocument();
    expect(screen.getByText('Existing Polygons')).toBeInTheDocument();
  });

  it('fetches and displays polygons (Read)', async () => {
    render(<PolygonCanvas />);
    await waitFor(() => expect(screen.getByText('Test Polygon')).toBeInTheDocument(), { timeout: 5000 });
  });

  it('allows creating a new polygon (Create)', async () => {
    render(<PolygonCanvas />);
    const input = screen.getByPlaceholderText('Enter polygon name...');
    const canvas = document.querySelector('canvas');
    const saveButton = screen.getByRole('button', { name: /save polygon/i });

    expect(canvas).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'New Polygon' } });
    fireEvent.click(canvas!, { clientX: 100, clientY: 100 });
    fireEvent.click(canvas!, { clientX: 200, clientY: 100 });
    fireEvent.click(canvas!, { clientX: 200, clientY: 200 });
    fireEvent.click(canvas!, { clientX: 100, clientY: 200 });
    fireEvent.click(saveButton);

    await waitFor(() => expect(screen.getByText('New Polygon')).toBeInTheDocument(), { timeout: 5000 });
  });

  it('allows deleting a polygon (Delete)', async () => {
    render(<PolygonCanvas />);
    await waitFor(() => expect(screen.getByText('Test Polygon')).toBeInTheDocument(), { timeout: 5000 });

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => expect(screen.queryByText('Test Polygon')).not.toBeInTheDocument(), { timeout: 5000 });
  });
});