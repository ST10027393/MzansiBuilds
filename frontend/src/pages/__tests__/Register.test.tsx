import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { Register } from '../Register';
import * as firebaseAuth from 'firebase/auth';
import api from '../../services/api';

vi.mock('../../services/firebase', () => ({ auth: {} }));
vi.mock('firebase/auth', () => ({ createUserWithEmailAndPassword: vi.fn() }));
vi.mock('../../services/api', () => ({ default: { post: vi.fn() } }));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual as any, useNavigate: () => mockNavigate };
});

describe('Register Component', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('displays an error when passwords do not match', async () => {
    render(<BrowserRouter><Register /></BrowserRouter>);

    // 1. Fill out the required fields so the form is allowed to submit
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'johndoe' } });
    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'john@test.com' } });
    
    // 2. Trigger the password mismatch
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: 'pass123' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'pass456' } }); // Mismatched!
    
    // 3. Click submit
    fireEvent.click(screen.getByRole('button', { name: /Sign up/i }));

    // 4. Assert the error state appears
    // Using findByText instead of getByText handles the slight delay in React state updates better!
    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
  });

  it('syncs to C# backend and navigates on success', async () => {
    (firebaseAuth.createUserWithEmailAndPassword as any).mockResolvedValueOnce({});
    (api.post as any).mockResolvedValueOnce({}); // Mock the C# Axios call

    render(<BrowserRouter><Register /></BrowserRouter>);

    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'johndoe' } });
    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'john@test.com' } });
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: 'securePass123' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'securePass123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Sign up/i }));

    await waitFor(() => {
      // Verify our Axios interceptor gets called to sync the database!
      expect(api.post).toHaveBeenCalledWith('/Users/sync', {
        email: 'john@test.com', username: 'johndoe', name: 'John', surname: 'Doe'
      });
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });
});