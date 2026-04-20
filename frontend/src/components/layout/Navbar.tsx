import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGlobalState } from '../../context/GlobalStateContext';
import { auth } from '../../services/firebase';
import { signOut } from 'firebase/auth';
import * as signalR from '@microsoft/signalr';
import api from '../../services/api';

export const Navbar = () => {
  const navigate = useNavigate();
  const { toggleChat } = useGlobalState();
  
  // Local state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Calculate unread count dynamically
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
  };

  // SignalR WebSocket Connection
  useEffect(() => {
    // 1. Fetch historical notifications on load
    api.get('/Notifications')
      .then(res => setNotifications(res.data))
      .catch(() => console.log("No notifications found"));

    // 2. Dynamically grab the base URL (stripping out the '/api' part)
    const backendUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : 'http://localhost:5152';

    // 3. Connect to the correct Hub URL
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${backendUrl}/hubs/notifications`)
      .withAutomaticReconnect()
      .build();

    connection.on("ReceiveNotification", (notification) => {
      // Instantly add new notification to the top of the list
      setNotifications(prev => [notification, ...prev]);
    });

    connection.start().catch(err => console.error("SignalR Connection Error: ", err));

    return () => { connection.stop(); };
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await api.patch(`/Notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      setIsNotificationsOpen(false); // Close dropdown after clicking
    } catch (e) {
      console.error("Failed to mark as read", e);
    }
  };

  return (
    <nav className="bg-[#010409] border-b border-github-border sticky top-0 z-50 text-github-text">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between">
        
        {/* LEFT SIDE: Logo */}
        <div className="flex items-center space-x-4">
          <Link to="/home" className="text-white hover:text-github-muted transition-colors">
            <svg className="w-10 h-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="20" fill="#161b22" stroke="#30363d" strokeWidth="4"/>
                <text x="50" y="65" fontSize="42" fontWeight="bold" fill="#c9d1d9" textAnchor="middle" fontFamily="sans-serif">mb</text>
            </svg>
          </Link>
        </div>

        {/* RIGHT SIDE: Action Icons & Profile */}
        <div className="flex items-center space-x-4">

          <Link to="/new" className="hidden md:flex items-center text-sm font-medium border border-github-border rounded-md px-3 py-1 hover:border-github-muted transition-colors">
            <svg className="w-4 h-4 mr-1 text-github-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            New
          </Link>

          <Link to="/celebrations" className="text-github-text hover:text-github-muted transition-colors relative" title="Celebration Wall">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
          </Link>

          <button onClick={toggleChat} className="text-github-text hover:text-github-muted transition-colors relative" title="Toggle Chat">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="text-github-text hover:text-github-muted transition-colors relative" title="Notifications">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center h-3 w-3 bg-blue-500 rounded-full text-[8px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-github-surface border border-github-border rounded-md shadow-lg py-2">
                <div className="px-4 py-2 border-b border-github-border font-semibold text-sm text-white flex justify-between">
                  <span>Notifications</span>
                </div>
                
                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-4 text-sm text-github-muted text-center">
                      You have no new notifications.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <Link 
                        to={notif.type === 'FriendAccept' ? `/profile/${notif.relatedEntityId}` : `/project/${notif.relatedEntityId}`}
                        key={notif.id} 
                        onClick={() => markAsRead(notif.id)}
                        className={`block px-4 py-3 text-sm hover:bg-github-dark cursor-pointer transition-colors ${!notif.isRead ? 'border-l-2 border-blue-500 bg-[#161b22]' : 'opacity-70'}`}
                      >
                        <p className="text-github-text font-semibold">{notif.content}</p>
                        <p className="text-[10px] text-github-muted mt-1">Click to view</p>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative pl-2 border-l border-github-border flex items-center cursor-pointer">
            <div onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center">
              <img src="https://avatars.githubusercontent.com/u/9919?s=40&v=4" alt="Profile" className="h-7 w-7 rounded-full border border-github-border" />
              <svg className="w-3 h-3 ml-1 text-github-muted" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
            </div>

            {isProfileOpen && (
              <div className="absolute right-0 top-10 mt-2 w-48 bg-github-surface border border-github-border rounded-md shadow-lg py-1">
                <Link to="/profile" className="block px-4 py-2 text-sm text-github-text hover:bg-blue-600 hover:text-white transition-colors" onClick={() => setIsProfileOpen(false)}>Your profile</Link>
                <div className="border-t border-github-border my-1"></div>
                <button onClick={handleSignOut} className="w-full text-left block px-4 py-2 text-sm text-github-text hover:bg-blue-600 hover:text-white transition-colors">Sign out</button>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};