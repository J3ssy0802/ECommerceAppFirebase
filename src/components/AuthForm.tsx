import { useEffect, useState } from 'react';
import { loginUser, registerUser } from '../services/authService';

type AuthMode = 'login' | 'register';

export default function AuthForm() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const nextNotice = sessionStorage.getItem('auth_notice');

    if (nextNotice) {
      setNotice(nextNotice);
      sessionStorage.removeItem('auth_notice');
    }
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        await registerUser(email, password);
      } else {
        await loginUser(email, password);
      }
      setEmail('');
      setPassword('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container my-5" style={{ maxWidth: '440px' }}>
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <h2 className="mb-3">{mode === 'register' ? 'Create Account' : 'Sign In'}</h2>
          <p className="text-muted mb-4">
            {mode === 'register'
              ? 'Register with your email and password to start shopping.'
              : 'Login with your email and password.'}
          </p>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {notice && (
            <div className="alert alert-success" role="alert">
              {notice}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="authEmail" className="form-label">
                Email
              </label>
              <input
                id="authEmail"
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="authPassword" className="form-label">
                Password
              </label>
              <input
                id="authPassword"
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading
                ? mode === 'register'
                  ? 'Creating Account...'
                  : 'Signing In...'
                : mode === 'register'
                  ? 'Register'
                  : 'Login'}
            </button>
          </form>

          <div className="mt-3 text-center">
            <button
              type="button"
              className="btn btn-link"
              onClick={() => {
                setMode(mode === 'register' ? 'login' : 'register');
                setEmail('');
                setPassword('');
                setError('');
              }}
              disabled={loading}
            >
              {mode === 'register' ? 'Already have an account? Login' : "Don't have an account? Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
