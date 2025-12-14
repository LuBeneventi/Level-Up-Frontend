// level-up-gaming-frontend/test/pages/AdminDashboard.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import axios from 'axios';
import AdminDashboard from '../../src/pages/AdminDashboard';

// Mock axios
vi.mock('axios');
const axiosGetMock = vi.spyOn(axios, 'get');

// Mock data
const mockProducts = [
  { id: '1', name: 'Product 1', countInStock: 3 },
  { id: '2', name: 'Product 2', countInStock: 10 },
];

const mockOrders = [
  { id: '1', totalPrice: 100, createdAt: new Date().toISOString(), items: [{ name: 'Product 1', quantity: 1 }] },
  { id: '2', totalPrice: 200, createdAt: '2023-10-27T10:00:00.000Z', items: [{ name: 'Product 2', quantity: 2 }] },
];

describe('AdminDashboard', () => {
  beforeEach(() => {
    axiosGetMock.mockReset();
  });

  it('1. Debería renderizar el título principal', async () => {
    axiosGetMock.mockResolvedValue({ data: [] });
    await act(async () => {
      render(<Router><AdminDashboard /></Router>);
    });
    expect(screen.getByText(/Panel de Administración/i)).toBeInTheDocument();
  });

  it('2. Debería renderizar todas las tarjetas de administración', async () => {
    axiosGetMock.mockResolvedValue({ data: [] });
    await act(async () => {
      render(<Router><AdminDashboard /></Router>);
    });

    expect(screen.getByTestId('card-products')).toBeInTheDocument();
    expect(screen.getByTestId('card-orders')).toBeInTheDocument();
    expect(screen.getByTestId('card-users')).toBeInTheDocument();
    expect(screen.getByTestId('card-events')).toBeInTheDocument();
    expect(screen.getByTestId('card-rewards')).toBeInTheDocument();
    expect(screen.getByTestId('card-blog')).toBeInTheDocument();
    expect(screen.getByTestId('card-videos')).toBeInTheDocument();
  });

  it('3. Debería mostrar una alerta cuando hay productos con bajo stock', async () => {
    axiosGetMock.mockImplementation((url) => {
      if (url === '/api/products') return Promise.resolve({ data: mockProducts });
      if (url === '/api/orders') return Promise.resolve({ data: mockOrders });
      return Promise.resolve({ data: [] });
    });

    await act(async () => {
      render(<Router><AdminDashboard /></Router>);
    });

    await waitFor(() => {
      expect(screen.getByText(/ALERTA DE INVENTARIO/i)).toBeInTheDocument();
    });
  });

  it('4. Debería mostrar los datos de análisis correctamente', async () => {
    axiosGetMock.mockImplementation((url) => {
      if (url === '/api/products') return Promise.resolve({ data: mockProducts });
      if (url === '/api/orders') return Promise.resolve({ data: mockOrders });
      return Promise.resolve({ data: [] });
    });

    await act(async () => {
      render(<Router><AdminDashboard /></Router>);
    });

    await waitFor(() => {
      expect(screen.getByText(/Ingresos Totales/i)).toBeInTheDocument();
      expect(screen.getByText(/Órdenes Nuevas \(Hoy\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Producto Más Vendido/i)).toBeInTheDocument();
    });
  });

  it('5. Debería mostrar los datos correctos en las tarjetas de análisis', async () => {
    axiosGetMock.mockImplementation((url) => {
      if (url === '/api/products') return Promise.resolve({ data: mockProducts });
      if (url === '/api/orders') return Promise.resolve({ data: mockOrders });
      return Promise.resolve({ data: [] });
    });

    await act(async () => {
      render(<Router><AdminDashboard /></Router>);
    });

    await waitFor(() => {
      expect(screen.getByText('$300')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
    });
  }, 15000);

  it('6. No debería mostrar una alerta de inventario cuando no hay productos con bajo stock', async () => {
    const productsWithHighStock = [
      { id: '1', name: 'Product 1', countInStock: 10 },
      { id: '2', name: 'Product 2', countInStock: 20 },
    ];

    axiosGetMock.mockImplementation((url) => {
      if (url === '/api/products') return Promise.resolve({ data: productsWithHighStock });
      if (url === '/api/orders') return Promise.resolve({ data: mockOrders });
      return Promise.resolve({ data: [] });
    });

    await act(async () => {
      render(<Router><AdminDashboard /></Router>);
    });

    await waitFor(() => {
      expect(screen.queryByText(/ALERTA DE INVENTARIO/i)).not.toBeInTheDocument();
    });
  }, 15000);
});
