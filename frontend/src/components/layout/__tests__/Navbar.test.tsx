import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import { Navbar } from '../Navbar';
import { GlobalStateContext } from '../../../context/GlobalStateContext';

// Mock Firebase auth
vi.mock('../../../services/firebase', () => ({ auth: {} }));
vi.mock('firebase/auth', () => ({ signOut: vi.fn() }));

describe('Navbar Component', () => {
  
  // We create a helper to render the Navbar with our dynamic Global State
  const renderNavbarWithState = (mockNotifications = []) => {
    render(
      <BrowserRouter>
        <GlobalStateContext.Provider value={{
          notifications: mockNotifications,
          setNotifications: vi.fn(),
          unreadCount: mockNotifications.filter((n: any) => !n.isRead).length,
          isChatOpen: false,
          toggleChat: vi.fn(),
          feedFilter: 'all',
          setFeedFilter: vi.fn()
        }}>
          <Navbar />
        </GlobalStateContext.Provider>
      </BrowserRouter>
    );
  };

  it('renders standard navigation links with correct paths', () => {
    renderNavbarWithState();
    expect(screen.getByText('New').closest('a')).toHaveAttribute('href', '/new');
    expect(screen.getByTitle('Celebration Wall').closest('a')).toHaveAttribute('href', '/celebrations');
  });

  it('shows no notifications by default', () => {
    renderNavbarWithState([]); // Pass empty array
    
    fireEvent.click(screen.getByTitle('Notifications'));
    expect(screen.getByText('You have no new notifications.')).toBeInTheDocument();
  });

  it('displays dynamic notifications and correct badge count', () => {
    // Inject mock database objects!
    const mockData = [
      { id: '1', message: 'Tanya accepted your request.', type: 'collab', isRead: false },
      { id: '2', message: 'Keegan commented on your post.', type: 'comment', isRead: true }
    ];
    
    renderNavbarWithState(mockData as any);
    
    // Expect badge to be '1' because only one isRead is false
    expect(screen.getByText('1')).toBeInTheDocument();
    
    fireEvent.click(screen.getByTitle('Notifications'));
    
    // Assert the mapped data appears
    expect(screen.getByText('Tanya accepted your request.')).toBeInTheDocument();
    expect(screen.getByText('Keegan commented on your post.')).toBeInTheDocument();
  });
});