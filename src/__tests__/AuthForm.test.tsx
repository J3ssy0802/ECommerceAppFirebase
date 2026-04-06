import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthForm from '../components/AuthForm';
import { loginUser, registerUser } from '../services/authService';

jest.mock('../services/authService', () => ({
  loginUser: jest.fn(),
  registerUser: jest.fn(),
}));

const mockLoginUser = loginUser as jest.Mock;
const mockRegisterUser = registerUser as jest.Mock;

describe('AuthForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders in login mode by default', () => {
    render(<AuthForm />);

    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /don't have an account/i })).toBeInTheDocument();
  });

  test('switches to register mode when the toggle button is clicked', () => {
    render(<AuthForm />);

    fireEvent.click(screen.getByRole('button', { name: /don't have an account/i }));

    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /already have an account/i })).toBeInTheDocument();
  });

  test('calls loginUser with email and password on login submit', async () => {
    mockLoginUser.mockResolvedValue(undefined);
    render(<AuthForm />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith('user@test.com', 'password123');
    });
  });

  test('displays an error alert when loginUser rejects', async () => {
    mockLoginUser.mockRejectedValue(new Error('Invalid credentials'));
    render(<AuthForm />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'bad@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
    });
  });

  test('calls registerUser with email and password in register mode', async () => {
    mockRegisterUser.mockResolvedValue(undefined);
    render(<AuthForm />);

    fireEvent.click(screen.getByRole('button', { name: /don't have an account/i }));
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'new@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'newpass123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalledWith('new@test.com', 'newpass123');
    });
  });
});
