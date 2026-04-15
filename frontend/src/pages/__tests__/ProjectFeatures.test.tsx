import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import { CreateProject } from '../CreateProject';
import { ProjectDetails } from '../ProjectDetails';
import api from '../../services/api';
import { GlobalStateContext } from '../../context/GlobalStateContext';

// Mock Firebase
vi.mock('../../services/firebase', () => ({ auth: {} }));
vi.mock('firebase/auth', () => ({ signOut: vi.fn() }));

// Mock Auth Context
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ currentUser: { email: 'viewer@test.com' } })
}));

// Mock API and Router
vi.mock('../../services/api', () => ({ default: { post: vi.fn(), get: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual as any, useNavigate: () => mockNavigate, useParams: () => ({ id: '123' }) };
});

describe('Project Features', () => {

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <BrowserRouter>
        <GlobalStateContext.Provider value={{
          notifications: [], setNotifications: vi.fn(),
          unreadCount: 0,
          isChatOpen: false, toggleChat: vi.fn(),
          feedFilter: 'all', setFeedFilter: vi.fn()
        }}>
          {ui}
        </GlobalStateContext.Provider>
      </BrowserRouter>
    );
  };

  it('CreateProject: Submits form and redirects to new project', async () => {
    (api.post as any).mockResolvedValueOnce({ data: { id: '999' } });

    (api.get as any).mockResolvedValue({ data: [] });

    renderWithProviders(<CreateProject />);

    fireEvent.change(screen.getByLabelText(/Project Title/i), { target: { value: 'Test App' } });
    fireEvent.change(screen.getByLabelText(/Short Description/i), { target: { value: 'A cool app' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Create Project/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/Projects/draft', { title: 'Test App', description: 'A cool app', repoLink: '' });
      expect(mockNavigate).toHaveBeenCalledWith('/project/999');
    });
  });

  it('ProjectDetails (Viewer View): Hides publish and delete buttons', async () => {
    // FIX: Provide the mock with the Ledgerly data so the assertions pass
    (api.get as any).mockImplementation((url: string) => {
      if (url === '/Notifications') return Promise.resolve({ data: [] });
      if (url === '/Projects/123') return Promise.resolve({ 
          data: { 
              id: '123', 
              title: 'Ledgerly', 
              description: 'A test description',
              authorEmail: 'owner@test.com', // Different from the mocked current user
              status: 'Published',
              milestones: [],
              collaborators: []
          } 
      });
      return Promise.resolve({ data: [] }); 
    });

    renderWithProviders(<ProjectDetails />);

    // Wait for the API to load the data
    await waitFor(() => {
      expect(screen.getByText(/Ledgerly/i)).toBeInTheDocument();
    });

    // Assert Owner buttons do NOT exist
    expect(screen.queryByText(/Publish Project/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Delete/i)).not.toBeInTheDocument();

    // Assert Viewer buttons & sections DO exist
    expect(screen.getByText(/Request Collaboration/i)).toBeInTheDocument();
    
    // Look specifically for the Comments heading instead of a generic button
    expect(screen.getByRole('heading', { name: /Comments/i })).toBeInTheDocument();
  });
});