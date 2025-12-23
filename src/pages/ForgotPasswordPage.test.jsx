import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ForgotPasswordPage } from './ForgotPasswordPage';

// Mock Firebase auth
const mockSendPasswordResetEmail = vi.fn();
vi.mock('firebase/auth', () => ({
  sendPasswordResetEmail: (...args) => mockSendPasswordResetEmail(...args),
}));

vi.mock('../config/firebase', () => ({
  getAuthInstance: () => ({ currentUser: null }),
}));

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    );
  };

  it('renders the forgot password form', () => {
    renderComponent();
    
    expect(screen.getByText(/reset password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });

  it('renders back to login link', () => {
    renderComponent();
    
    expect(screen.getByText(/back to sign in/i)).toBeInTheDocument();
  });

  it('shows validation error for empty email on submit', async () => {
    renderComponent();
    
    const form = screen.getByRole('button', { name: /send reset link/i }).closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email format', async () => {
    renderComponent();
    
    const emailInput = screen.getByPlaceholderText('you@example.com');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });
  });

  it('calls sendPasswordResetEmail with valid email', async () => {
    mockSendPasswordResetEmail.mockResolvedValueOnce();
    renderComponent();
    
    const emailInput = screen.getByPlaceholderText('you@example.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const form = screen.getByRole('button', { name: /send reset link/i }).closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(mockSendPasswordResetEmail).toHaveBeenCalled();
    });
  });

  it('shows success message after sending reset email', async () => {
    mockSendPasswordResetEmail.mockResolvedValueOnce();
    renderComponent();
    
    const emailInput = screen.getByPlaceholderText('you@example.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const form = screen.getByRole('button', { name: /send reset link/i }).closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
  });

  it('shows success message even when user not found (security)', async () => {
    const error = new Error('User not found');
    error.code = 'auth/user-not-found';
    mockSendPasswordResetEmail.mockRejectedValueOnce(error);
    renderComponent();
    
    const emailInput = screen.getByPlaceholderText('you@example.com');
    fireEvent.change(emailInput, { target: { value: 'notfound@example.com' } });
    
    const form = screen.getByRole('button', { name: /send reset link/i }).closest('form');
    fireEvent.submit(form);
    
    // Should still show success for security reasons
    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
  });

  it('shows error message on rate limit', async () => {
    const error = new Error('Too many requests');
    error.code = 'auth/too-many-requests';
    mockSendPasswordResetEmail.mockRejectedValueOnce(error);
    renderComponent();
    
    const emailInput = screen.getByPlaceholderText('you@example.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const form = screen.getByRole('button', { name: /send reset link/i }).closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
    });
  });
});
