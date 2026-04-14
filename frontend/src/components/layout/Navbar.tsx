import { Link } from 'react-router-dom';

export const Navbar = () => {
  return (
    <nav className="bg-[#010409] border-b border-github-border sticky top-0 z-50 text-github-text">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between">
        
        {/* LEFT SIDE: Logo & Search */}
        <div className="flex items-center space-x-4 flex-1">
          <Link to="/" className="text-white hover:text-github-muted transition-colors">
            {/* Simple MzansiBuilds Logo placeholder (resembling GitHub cat layout) */}
            <svg className="w-12 h-12 mb-4" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="20" fill="#161b22" stroke="#30363d" strokeWidth="4"/>
                <text x="50" y="68" fontSize="48" fontWeight="bold" fill="#c9d1d9" textAnchor="middle" fontFamily="sans-serif">mb</text>
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