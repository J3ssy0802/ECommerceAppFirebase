import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

interface HeaderProps {
  isAuthenticated: boolean;
  userEmail: string | null;
  onLogout: () => Promise<void>;
}

export default function Header({ isAuthenticated, userEmail, onLogout }: HeaderProps) {
  const { totalItems } = useSelector((state: RootState) => state.cart);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/">
          🛍️ eStore
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/">
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/cart">
                    🛒 Cart
                    {totalItems > 0 && (
                      <span className="badge bg-danger ms-2">{totalItems}</span>
                    )}
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">
                    Profile
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/orders">
                    Orders
                  </Link>
                </li>
                {userEmail && (
                  <li className="nav-item d-flex align-items-center text-light me-3">
                    {userEmail}
                  </li>
                )}
                <li className="nav-item d-flex align-items-center">
                  <button className="btn btn-outline-light btn-sm" onClick={() => void onLogout()}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Login / Register
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
