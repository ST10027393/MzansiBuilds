import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Login } from '../Login';
import * as firebaseAuth from 'firebase/auth';

// Mock Firebase and our router
vi.mock('../../services/firebase', () => ({ auth: {} }));
vi.mock('firebase/auth', () => ({ signInWithEmailAndPassword: vi.fn() }));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual as any, useNavigate: () => mockNavigate };
});

describe('Login Component', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('navigates to home on successful login', async () => {
    (firebaseAuth.signInWithEmailAndPassword as any).mockResolvedValueOnce({});

    render(<BrowserRouter><Login /></BrowserRouter>);

    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  it('displays an error on invalid credentials', async () => {
    (firebaseAuth.signInWithEmailAndPassword as any).mockRejectedValueOnce({ code: 'auth/invalid-credential' });

    render(<BrowserRouter><Login /></BrowserRouter>);

    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'wrong@test.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Incorrect email or password.')).toBeInTheDocument();
    });
  });
});