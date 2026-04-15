import { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { ThreePaneLayout } from '../components/layout/ThreePaneLayout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { useGlobalState } from '../context/GlobalStateContext';
import api from '../services/api';
import { Link } from 'react-router-dom';

// Define TypeScript interfaces for our expected database data
interface Project {
  id: string;
  title: string;
  description: string;
  authorUsername: string;
  authorId: string; 
  status: string;
  createdAt: string;
  owner?: { username: string }; 
}

export const Dashboard = () => {
  const { isChatOpen } = useGlobalState();
  const { currentUser } = useAuth();

  const [searchProjectsQuery, setSearchProjectsQuery] = useState('');

  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [feedProjects, setFeedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [friends, setFriends] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [myProjRes, feedRes, friendsRes] = await Promise.all([
          api.get('/Projects/mine').catch(() => ({ data: [] })), 
          api.get('/Projects/feed').catch(() => ({ data: [] })),
          api.get('/Friendship').catch(() => ({ data: [] })) 
        ]);

        setMyProjects(myProjRes.data);
        setFeedProjects(feedRes.data);
        setFriends(friendsRes.data);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // --- FILTER STATES ---
  const [filterStatus, setFilterStatus] = useState<'All' | 'Published' | 'Completed'>('All');
  const [sortDate, setSortDate] = useState<'Newest' | 'Oldest'>('Newest');
  const [friendsOnly, setFriendsOnly] = useState(false);

  // --- FILTER LOGIC ---
  const processedFeedProjects = feedProjects
    .filter(p => filterStatus === 'All' || p.status === filterStatus)
    .filter(p => {
      if (!friendsOnly) return true;
      return friends.some(f => f.requesterId === p.authorId || f.addresseeId === p.authorId);
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return sortDate === 'Newest' ? dateB - dateA : dateA - dateB; 
    });

  const filteredMyProjects = myProjects.filter(project =>
    project.title.toLowerCase().includes(searchProjectsQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchProjectsQuery.toLowerCase())
  );

  // --- LEFT PANE ---
  const LeftContent = (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Avatar size="lg" />
        <div>
          <h2 className="font-bold text-lg leading-tight text-white">
            {currentUser?.email?.split('@')[0] || 'Developer'}
          </h2>
          <p className="text-github-muted text-sm">{currentUser?.email}</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-white">Top Projects</h3>
          <Link to="/new" className="bg-github-green text-white px-3 py-1 rounded-md font-medium text-xs hover:bg-green-600 transition-colors">
            New
          </Link>
        </div>
        
        <div className="hidden md:flex flex-1 max-w-sm mb-4">
          <input 
            type="text" 
            placeholder="Find a project..." 
            value={searchProjectsQuery}
            onChange={(e) => setSearchProjectsQuery(e.target.value)}
            className="w-full bg-github-dark border border-github-border rounded-md px-3 py-1 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-github-muted" 
          />
        </div>

        <div className="space-y-2">
          {loading ? (
            <p className="text-xs text-github-muted italic">Loading projects...</p>
          ) : filteredMyProjects.length === 0 ? (
            <p className="text-xs text-github-muted border border-dashed border-github-border p-3 rounded text-center">
              You haven't created any projects yet.
            </p>
          ) : (
            <>
              {filteredMyProjects.map(project => (
                <Link to={`/project/${project.id}`} key={project.id} className="block mb-2">
                  <Card hoverable className="!p-3 border-l-4 border-l-transparent hover:border-l-blue-500 transition-all cursor-pointer">
                    <h4 className="font-semibold text-sm text-blue-400">
                      {(project.authorUsername || project.owner?.username)}-{project.title}
                    </h4>
                    <p className="text-xs text-github-muted mt-1 truncate">{project.description}</p>
                  </Card>
                </Link>
              ))}
              
              <Link to="/profile" className="block text-center text-xs text-blue-400 hover:text-blue-300 mt-4 py-2 border border-github-border rounded-md hover:bg-github-surface transition-colors">
                Show all projects
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // --- MIDDLE PANE ---
  const MiddleContent = (
    <div className="space-y-4">
      <div className="flex flex-col border-b border-github-border pb-3 mb-4 space-y-3">
        <h2 className="text-xl font-bold text-white">Live Feed</h2>
        
        <div className="flex flex-wrap gap-2 items-center bg-github-surface p-2 rounded-md border border-github-border">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-github-dark border border-github-border text-xs text-github-text rounded px-2 py-1 outline-none focus:border-blue-500"
          >
            <option value="All">Status: All</option>
            <option value="Published">Status: Published</option>
            <option value="Completed">Status: Completed</option>
          </select>

          <select 
            value={sortDate} 
            onChange={(e) => setSortDate(e.target.value as any)}
            className="bg-github-dark border border-github-border text-xs text-github-text rounded px-2 py-1 outline-none focus:border-blue-500"
          >
            <option value="Newest">Date: Newest</option>
            <option value="Oldest">Date: Oldest</option>
          </select>

          <label className="flex items-center space-x-1 cursor-pointer text-xs text-github-text ml-auto">
            <input 
              type="checkbox" 
              checked={friendsOnly}
              onChange={(e) => setFriendsOnly(e.target.checked)}
              className="rounded bg-github-dark border-github-border focus:ring-blue-500"
            />
            <span>Friends Only</span>
          </label>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-github-muted text-center py-10">Fetching latest activity...</p>
      ) : processedFeedProjects.length === 0 ? (
        <Card className="text-center py-10 border-dashed border-github-border">
          <p className="text-sm text-github-muted">No projects match these filters.</p>
        </Card>
      ) : (
        processedFeedProjects.map(project => (
          <Link to={`/project/${project.id}`} key={project.id} className="block mb-4">
            <Card hoverable className="space-y-3 border-l-2 border-l-transparent hover:border-l-blue-500">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar size="sm" />
                  <span className="font-semibold text-sm text-white">{project.authorUsername || project.owner?.username}-{project.title}</span>
                </div>
                <Badge text={project.status || "Published"} color={project.status === 'Completed' ? 'green' : 'muted'} />
              </div>
              <p className="text-sm text-github-text">{project.description}</p>
              <div className="pt-2 border-t border-github-border flex space-x-2">
                <Button variant="secondary" className="!text-xs">Collaborate</Button>
                <Button variant="secondary" className="!text-xs">Comment</Button>
              </div>
            </Card>
          </Link>
        ))
      )}
    </div>
  );

  // --- RIGHT PANE ---
  const RightContent = (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-github-border pb-2">
        <h3 className="font-semibold text-sm text-white">Recent Chats</h3>
        <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">3</span>
      </div>
      
      <div className="space-y-2">
        <div className="bg-[#161b22] p-2 rounded-md flex items-center space-x-3 cursor-pointer border border-transparent hover:border-github-border transition-colors">
          <Avatar size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between">
              <p className="text-xs font-bold text-white truncate">Elishua Naidoo</p>
              <p className="text-[9px] text-github-muted">2m</p>
            </div>
            <p className="text-[10px] text-github-muted truncate mt-0.5">Let's start the API design.</p>
          </div>
        </div>

        <div className="bg-[#161b22] p-2 rounded-md flex items-center space-x-3 cursor-pointer border border-transparent hover:border-github-border transition-colors">
          <Avatar size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between">
              <p className="text-xs font-bold text-white truncate">Kaiyur Khedun</p>
              <p className="text-[9px] text-github-muted">1h</p>
            </div>
            <p className="text-[10px] text-github-muted truncate mt-0.5">I'll push the frontend updates.</p>
          </div>
        </div>
      </div>
    </div>
  );

  // === THE MISSING PIECE! ===
  // We must return the layout to React so it actually draws the screen!
  return (
    <div className="min-h-screen bg-github-dark font-sans flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <ThreePaneLayout 
          left={LeftContent} 
          middle={MiddleContent} 
          right={RightContent} 
          hideRight={!isChatOpen} 
        />
      </div>
    </div>
  );
};