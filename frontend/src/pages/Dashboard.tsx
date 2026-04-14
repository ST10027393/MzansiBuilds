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
  status: string;
}

export const Dashboard = () => {
  const { isChatOpen } = useGlobalState();
  // Grab the real logged-in user from Firebase!
  const { currentUser } = useAuth();

  // State for search query in left pane
  const [searchProjectsQuery, setSearchProjectsQuery] = useState('');

  // State to hold our live database pulls
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [feedProjects, setFeedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from C# SQLite database on load
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // NOTE: Adjust these route strings to match your actual C# controller routes!
        // We use Promise.all to fetch them simultaneously for speed.
        const [myProjRes, feedRes] = await Promise.all([
          api.get('/Projects/mine').catch(() => ({ data: [] })), 
          api.get('/Projects/feed').catch(() => ({ data: [] }))
        ]);

        setMyProjects(myProjRes.data);
        setFeedProjects(feedRes.data);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Filter local projects based on search query
  const filteredMyProjects = myProjects.filter(project =>
    project.title.toLowerCase().includes(searchProjectsQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchProjectsQuery.toLowerCase())
  );

  // --- LEFT PANE (User Profile & Own Projects) ---
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
          <Button variant="primary" className="!py-1 !px-2 text-xs">New</Button>
        </div>
        
        {/* Search Bar (Moved to Left Pane) */}
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
            filteredMyProjects.map(project => (
              /* Wrap the Card in a Link so it is clickable! */
              <Link to={`/project/${project.id}`} key={project.id} className="block mb-2">
                <Card hoverable className="!p-3 border-l-4 border-l-transparent hover:border-l-blue-500 transition-all cursor-pointer">
                  <h4 className="font-semibold text-sm text-blue-400">{project.title}</h4>
                  <p className="text-xs text-github-muted mt-1 truncate">{project.description}</p>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );

  // --- MIDDLE PANE (Live Feed) ---
  const MiddleContent = (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-github-border pb-3 mb-4">
        <h2 className="text-xl font-bold text-white">Live Feed</h2>
        <div className="space-x-2">
          <Badge text="Filter: All" />
          <Badge text="Status: Active" />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-github-muted text-center py-10">Fetching latest activity...</p>
      ) : feedProjects.length === 0 ? (
        <Card className="text-center py-10">
          <p className="text-sm text-github-muted">The feed is quiet. Be the first to publish a project!</p>
        </Card>
      ) : (
        feedProjects.map(project => (
          <Card key={project.id} hoverable className="space-y-3 mb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <Avatar size="sm" />
                <span className="font-semibold text-sm text-white">{project.authorUsername} / {project.title}</span>
              </div>
              <Badge text={project.status || "Published"} color="green" />
            </div>
            <p className="text-sm text-github-text">{project.description}</p>
            <div className="pt-2 border-t border-github-border flex space-x-2">
              <Button variant="secondary" className="!text-xs">Collaborate</Button>
              <Button variant="secondary" className="!text-xs">Comment</Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );

  // --- RIGHT PANE (Pending Requests) ---
  const RightContent = (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-sm mb-3 text-github-muted">Pending Requests</h3>
        <Card className="!p-3 space-y-2 border-l-4 border-l-blue-500">
          <p className="text-xs text-github-text">
            <span className="font-bold text-white">Elishua Naidoo</span> wants to collaborate.
          </p>
          <div className="flex space-x-2 pt-1">
            <Button variant="primary" className="!py-0.5 !px-2 text-xs">Accept</Button>
            <Button variant="danger" className="!py-0.5 !px-2 text-xs">Decline</Button>
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-github-dark font-sans flex flex-col">
      <Navbar />
      <div className="flex-grow">
        {/* We pass hideRight based on the global state! */}
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