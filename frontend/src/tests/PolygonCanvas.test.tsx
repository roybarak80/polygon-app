import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { rest, RestContext } from 'msw';
import { setupServer } from 'msw/node';
import PolygonCanvas from '../components/PolygonCanvas';
import '@testing-library/jest-dom';
import 'jest-canvas-mock';

const server = setupServer(
  rest.get('http://localhost:3001/api/polygons', (req, res, ctx: RestContext) => {
    console.log('MSW: GET /api/polygons intercepted');
    return res(ctx.json([
      { id: '1', name: 'Test Polygon', points: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }] }
    ]));
  }),
  rest.post('http://localhost:3001/api/polygons', async (req, res, ctx: RestContext) => {
    console.log('MSW: POST /api/polygons intercepted');
    const { name, points } = await req.json();
    return res(ctx.status(201), ctx.json({ id: '2', name, points }));
  }),
  rest.delete('http://localhost:3001/api/polygons/:id', (req, res, ctx: RestContext) => {
    console.log('MSW: DELETE /api/polygons/:id intercepted');
    return res(ctx.status(204));
  })
);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe.skip('PolygonCanvas', () => {
  it('renders canvas and input', () => {
    render(<PolygonCanvas />);
    expect(screen.getByPlaceholderText('Polygon name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save polygon/i })).toBeInTheDocument();
  });

  it('fetches and displays polygons', async () => {
    render(<PolygonCanvas />);
    await waitFor(() => {
      expect(screen.getByText('Test Polygon')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('allows creating a new polygon', async () => {
    render(<PolygonCanvas />);
    const input = screen.getByPlaceholderText('Polygon name');
    const canvas = screen.getByRole('img', { hidden: true });
    const saveButton = screen.getByRole('button', { name: /save polygon/i });

    fireEvent.change(input, { target: { value: 'New Polygon' } });
    fireEvent.click(canvas, { clientX: 100, clientY: 100 });
    fireEvent.click(canvas, { clientX: 200, clientY: 100 });
    fireEvent.click(canvas, { clientX: 200, clientY: 200 });
    fireEvent.click(canvas, { clientX: 100, clientY: 200 });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('New Polygon')).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});