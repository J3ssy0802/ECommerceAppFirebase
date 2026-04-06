import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Cart from '../components/Cart';
import cartReducer, { type CartItem } from '../store/cartSlice';
import { createOrder } from '../services/orderService';

jest.mock('../services/orderService', () => ({
  createOrder: jest.fn().mockResolvedValue(undefined),
}));

const mockCreateOrder = createOrder as jest.Mock;

const mockUser = { uid: 'test-uid', email: 'user@test.com' } as any;

const sampleItems: CartItem[] = [
  { id: '1', title: 'Test Product', price: 29.99, image: 'https://example.com/img.jpg', quantity: 2 },
];

interface PreloadedCart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

function renderCart(cart: PreloadedCart) {
  const testStore = configureStore({
    reducer: { cart: cartReducer },
    preloadedState: { cart },
  });
  return render(
    <Provider store={testStore}>
      <Cart user={mockUser} />
    </Provider>
  );
}

describe('Cart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateOrder.mockResolvedValue(undefined);
  });

  test('displays an empty cart message when there are no items', () => {
    renderCart({ items: [], totalItems: 0, totalPrice: 0 });

    expect(screen.getByText(/your shopping cart is empty/i)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  test('renders cart item title and price when items are present', () => {
    renderCart({ items: sampleItems, totalItems: 2, totalPrice: 59.98 });

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  test('removes an item when the Remove button is clicked', () => {
    renderCart({ items: sampleItems, totalItems: 2, totalPrice: 59.98 });

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /remove/i }));
    expect(screen.queryByText('Test Product')).not.toBeInTheDocument();
  });

  test('opens the confirmation modal when Proceed to Checkout is clicked', () => {
    renderCart({ items: sampleItems, totalItems: 2, totalPrice: 59.98 });

    fireEvent.click(screen.getByRole('button', { name: /proceed to checkout/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/confirm order/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /place order/i })).toBeInTheDocument();
  });

  test('shows Order Placed screen after successful checkout', async () => {
    renderCart({ items: sampleItems, totalItems: 2, totalPrice: 59.98 });

    fireEvent.click(screen.getByRole('button', { name: /proceed to checkout/i }));
    fireEvent.click(screen.getByRole('button', { name: /place order/i }));

    await waitFor(() => {
      expect(screen.getByText(/order placed!/i)).toBeInTheDocument();
    });

    expect(mockCreateOrder).toHaveBeenCalledWith({
      userId: 'test-uid',
      userEmail: 'user@test.com',
      items: sampleItems,
      totalItems: 2,
      totalPrice: 59.98,
    });
  });
});
