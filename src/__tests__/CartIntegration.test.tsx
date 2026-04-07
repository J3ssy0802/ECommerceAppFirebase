/**
 * Integration tests: adding a product from Home updates the Cart and Header.
 *
 * All three components (Home, Header, Cart) share the same Redux store so
 * that dispatch actions made inside Home are reflected in both the Header
 * badge and the Cart page without any prop drilling.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Home from '../components/Home';
import Header from '../components/Header';
import Cart from '../components/Cart';
import cartReducer from '../store/cartSlice';
import { getAllProducts } from '../services/productService';

// ————————Mocks————————
jest.mock('../services/productService', () => ({
  getAllProducts: jest.fn(),
  createProduct: jest.fn().mockResolvedValue({}),
  updateProduct: jest.fn().mockResolvedValue({}),
  deleteProduct: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../services/orderService', () => ({
  createOrder: jest.fn().mockResolvedValue(undefined),
}));

const mockGetAllProducts = getAllProducts as jest.Mock;

// ————————Sample data————————
const sampleProducts = [
  {
    id: 'prod-1',
    title: 'Test Widget',
    price: 24.99,
    category: 'electronics',
    description: 'A first test widget',
    image: 'https://example.com/widget1.jpg',
  },
  {
    id: 'prod-2',
    title: 'Another Widget',
    price: 12.50,
    category: 'electronics',
    description: 'A second test widget',
    image: 'https://example.com/widget2.jpg',
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockUser = { uid: 'test-uid', email: 'user@test.com' } as any;

/**
 * Renders the full app shell (Header + Home + Cart routes) sharing one Redux
 * store and one QueryClient. Returns the store so individual tests can inspect
 * the raw Redux state.
 */
function renderApp(initialPath = '/') {
  const testStore = configureStore({ reducer: { cart: cartReducer } });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });

  render(
    <Provider store={testStore}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialPath]}>
          <Header
            isAuthenticated={true}
            userEmail={mockUser.email}
            onLogout={jest.fn().mockResolvedValue(undefined)}
          />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart user={mockUser} />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );

  return testStore;
}

/** Wait for "Add to Cart" buttons to be present in the DOM. */
async function waitForProducts() {
  await waitFor(() => {
    expect(screen.getAllByRole('button', { name: /add to cart/i })).toHaveLength(
      sampleProducts.length
    );
  });
}

// ———————————— Tests ————————————————

describe('Cart integration: adding products from the Home page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllProducts.mockResolvedValue(sampleProducts);
  });

  test('Header cart badge increments when a product is added from Home', async () => {
    renderApp();
    await waitForProducts();

    // Badge must not exist before any item is added
    expect(screen.queryByText('1')).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: /add to cart/i })[0]);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  test('adding the same product twice increments the badge to 2', async () => {
    renderApp();
    await waitForProducts();

    const [firstAddButton] = screen.getAllByRole('button', { name: /add to cart/i });
    fireEvent.click(firstAddButton);
    fireEvent.click(firstAddButton);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  test('adding two different products sets the badge count to 2', async () => {
    renderApp();
    await waitForProducts();

    const addButtons = screen.getAllByRole('button', { name: /add to cart/i });
    fireEvent.click(addButtons[0]);
    fireEvent.click(addButtons[1]);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  test('Cart page shows the added product title and price after navigating', async () => {
    renderApp();
    await waitForProducts();

    fireEvent.click(screen.getAllByRole('button', { name: /add to cart/i })[0]);

    // Simulate navigating to /cart via the header link
    fireEvent.click(screen.getByRole('link', { name: /cart/i }));

    // Wait for Home to unmount (its "Add to Cart" buttons disappear) before asserting Cart content
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /add to cart/i })).not.toBeInTheDocument();
    });

    expect(screen.getByText('Test Widget')).toBeInTheDocument();
    // Cart renders the price in: unit price cell, subtotal cell, and the order summary total
    expect(screen.getAllByText('$24.99')).toHaveLength(3);
  });

  test('Cart page shows empty message when navigated to before any item is added', async () => {
    renderApp();
    await waitForProducts();

    fireEvent.click(screen.getByRole('link', { name: /cart/i }));

    expect(screen.getByText(/your shopping cart is empty/i)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  test('Redux store reflects the correct item, quantity, and price after adding', async () => {
    const testStore = renderApp();
    await waitForProducts();

    fireEvent.click(screen.getAllByRole('button', { name: /add to cart/i })[0]);

    const { cart } = testStore.getState();
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].id).toBe('prod-1');
    expect(cart.items[0].title).toBe('Test Widget');
    expect(cart.items[0].quantity).toBe(1);
    expect(cart.totalItems).toBe(1);
    expect(cart.totalPrice).toBeCloseTo(24.99);
  });

  test('Redux store accumulates two items when both products are added', async () => {
    const testStore = renderApp();
    await waitForProducts();

    const addButtons = screen.getAllByRole('button', { name: /add to cart/i });
    fireEvent.click(addButtons[0]);
    fireEvent.click(addButtons[1]);

    const { cart } = testStore.getState();
    expect(cart.items).toHaveLength(2);
    expect(cart.totalItems).toBe(2);
    expect(cart.totalPrice).toBeCloseTo(24.99 + 12.50);
  });
});
