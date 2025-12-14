// /test/components/ProductCard.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from '../../src/components/ProductCard';
import { Product } from '../../src/types/Product';

// ---------------------------
// MOCK DEL CONTEXTO DE CARRITO
// ---------------------------
const mockAddToCart = vi.fn();
let mockCartItems: any[] = [];

vi.mock('../../src/context/CartContext', () => ({
  useCart: () => ({
    addToCart: mockAddToCart,
    cartItems: mockCartItems
  })
}));

// ---------------------------
// PRODUCTO MOCK
// ---------------------------
const mockProduct: Product = {
  id: 'JM001',
  name: 'Catan',
  price: 29990,
  imageUrl: '/images/juego-catan.png',
  rating: 4.8,
  numReviews: 156,
  countInStock: 10,
  category: 'Juegos de Mesa',
  description: 'Un clásico juego de estrategia.',
  isTopSelling: true,
  specifications: '{}',
  reviews: [],
  isActive: false
};

// ---------------------------
// TESTS
// ---------------------------
describe('ProductCard', () => {

  beforeEach(() => {
    mockAddToCart.mockClear();
    mockCartItems = [];   // carrito vacío antes de cada test
  });

  const renderCard = (prod = mockProduct) =>
    render(
      <MemoryRouter>
        <ProductCard product={prod} />
      </MemoryRouter>
    );

  // 1
  it('1. renderiza la información del producto', () => {
    renderCard();

    expect(screen.getByText('Catan')).toBeInTheDocument();
    expect(screen.getByText('$29.990')).toBeInTheDocument();
    expect(screen.getByText('(156 opiniones)')).toBeInTheDocument();

    const image = screen.getByAltText('Catan') as HTMLImageElement;
    expect(image.src).toContain('/images/juego-catan.png');
  });

  // 2
  it('2. llama a addToCart al hacer clic en "Añadir al Carrito"', async () => {
    const user = userEvent.setup();
    renderCard();

    const btn = screen.getByRole('button', { name: /Añadir al Carrito/i });
    expect(btn).not.toBeDisabled();

    await user.click(btn);

    expect(mockAddToCart).toHaveBeenCalledTimes(1);
    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct, 1);
  });

  // 3
  it('3. muestra "AGOTADO" si no hay stock', () => {
    renderCard({ ...mockProduct, countInStock: 0 });

    const button = screen.getByRole('button', { name: /AGOTADO/i });
    expect(button).toBeDisabled();
  });

  // 4
  it('4. muestra "EN CARRITO" si ya está en el carrito', () => {
    mockCartItems = [{ product: mockProduct, quantity: 1 }];
    renderCard();

    const button = screen.getByRole('button', { name: /EN CARRITO/i });
    expect(button).toBeDisabled();
  });

  // 5
  it('5. NO llama a addToCart si ya está en el carrito', async () => {
    const user = userEvent.setup();
    mockCartItems = [{ product: mockProduct, quantity: 1 }];
    renderCard();

    const btn = screen.getByRole('button', { name: /EN CARRITO/i });

    await user.click(btn);

    expect(mockAddToCart).not.toHaveBeenCalled();
  });

  // 6
  it('6. usa imagen fallback si falla la imagen', () => {
    renderCard();

    const img = screen.getByAltText('Catan');
    fireEvent.error(img);

    expect((img as HTMLImageElement).src).toContain('https://via.placeholder.com');
  });
});
