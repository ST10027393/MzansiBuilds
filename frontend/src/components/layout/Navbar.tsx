import { Link } from 'react-router-dom';

export const Navbar = () => {
  return (
    <nav className="bg-[#010409] border-b border-github-border sticky top-0 z-50 text-github-text">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between">
        
        {/* LEFT SIDE: Logo & Search */}
        <div className="flex items-center space-x-4 flex-1">
          <Link to="/" className="text-white hover:text-github-muted transition-colors">
            {/* Simple MzansiBuilds Logo placeholder (resembling GitHub cat layout) */}
            <svg height="32" viewBox="0 0 16 16" width="32" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
          </Link>
          
          {/* GitHub-style Search Bar */}
          <div className="hidden md:flex flex-1 max-w-sm">
            <input 
              type="text" 
              placeholder="Search or jump to..." 
              className="w-full bg-github-dark border border-github-border rounded-md px-3 py-1 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-github-muted"
            />
          </div>
        </div>

        {/* RIGHT SIDE: Action Icons & Profile */}
        <div className="flex items-center space-x-4">
          
          {/* New Project Button (Primary Action) */}
          <Link to="/new" className="hidden md:flex items-center text-sm font-medium border border-github-border rounded-md px-3 py-1 hover:border-github-muted transition-colors">
            <svg className="w-4 h-4 mr-1 text-github-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            New
          </Link>

          {/* Celebrations Icon (Trophy) */}
          <Link to="/celebrations" className="text-github-text hover:text-github-muted transition-colors relative" title="Celebration Wall">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
          </Link>

          {/* Chat Icon */}
          <button className="text-github-text hover:text-github-muted transition-colors relative" title="Chats">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
            {/* Unread Chat Badge */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
          </button>

          {/* Notifications Icon */}
          <button className="text-github-text hover:text-github-muted transition-colors relative" title="Notifications">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          </button>

          {/* Profile Dropdown Trigger */}
          <div className="pl-2 border-l border-github-border flex items-center cursor-pointer">
            <img 
              src="https://avatars.githubusercontent.com/u/9919?s=40&v=4" // Placeholder Avatar
              alt="Profile" 
              className="h-7 w-7 rounded-full border border-github-border"
            />
            <svg className="w-3 h-3 ml-1 text-github-muted" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
          </div>

        </div>
      </div>
    </nav>
  );
};