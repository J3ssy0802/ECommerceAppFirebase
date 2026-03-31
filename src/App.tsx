import { useEffect, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import './App.css';
import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home.tsx';
import Cart from './components/Cart.tsx';
import AuthForm from './components/AuthForm';
import Profile from './components/Profile';
import Orders from './components/Orders';
import OrderDetail from './components/OrderDetail';
import { logoutUser, subscribeToAuthChanges } from './services/authService';
import { setCartItems } from './store/cartSlice';
import { useAppDispatch, useAppSelector } from './store/hooks';

function getUserCartSessionKey(userId: string): string {
  return `cart_items_${userId}`;
}

function loadUserCartFromSession(userId: string) {
  try {
    const raw = sessionStorage.getItem(getUserCartSessionKey(userId));
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const hydratedCartUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((nextUser) => {
      setUser(nextUser);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  async function handleLogout() {
    await logoutUser();
  }

  useEffect(() => {
    if (!user) {
      hydratedCartUserIdRef.current = null;
      dispatch(setCartItems([]));
      return;
    }

    const savedItems = loadUserCartFromSession(user.uid);
    dispatch(setCartItems(savedItems));
    hydratedCartUserIdRef.current = user.uid;
  }, [dispatch, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (hydratedCartUserIdRef.current !== user.uid) {
      return;
    }

    sessionStorage.setItem(getUserCartSessionKey(user.uid), JSON.stringify(cartItems));
  }, [cartItems, user]);

  if (authLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading authentication status...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Header isAuthenticated={!!user} userEmail={user?.email ?? null} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={user ? <Home /> : <AuthForm />} />
        <Route path="/cart" element={user ? <Cart user={user} /> : <AuthForm />} />
        <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/" replace />} />
        <Route path="/orders" element={user ? <Orders user={user} /> : <Navigate to="/" replace />} />
        <Route path="/orders/:orderId" element={user ? <OrderDetail user={user} /> : <Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;