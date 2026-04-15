// FILE: frontend/src/pages/Celebrations.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { ThreePaneLayout } from '../components/layout/ThreePaneLayout';
import { Card } from '../components/common/Card';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useGlobalState } from '../context/GlobalStateContext';
import { useAuth } from '../context/AuthContext';
import type { Project } from '../types';
import api from '../services/api';

export const Celebrations = () => {
  const { isChatOpen } = useGlobalState();
  const { currentUser } = useAuth();
  
  const [completedProjects, setCompletedProjects] = useState<Project[]>([]);
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [searchProjectsQuery, setSearchProjectsQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCelebrationData = async () => {
      try {
        // Fetch strictly completed projects AND the user's projects simultaneously
        const [celebRes, myProjRes] = await Promise.all([
          api.get('/Projects/celebrations').catch(() => ({ data: [] })),
          api.get('/Projects/mine').catch(() => ({ data: [] }))
        ]);
        
        setCompletedProjects(celebRes.data);
        setMyProjects(myProjRes.data);
      } catch (error) {
        console.error("Failed to load celebration data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCelebrationData();
  }, []);

  // Filter local projects based on search query for the Left Pane
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
          <Link to="/new" className="bg-github-green text-white px-3 py-1 rounded-md font-medium text-xs hover:bg-green-600 transition-colors">
            New
          </Link>
        </div>
        
        {/* Search Bar */}
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
                      {currentUser?.email?.split('@')[0]}-{project.title}
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

  // --- MIDDLE PANE (Celebration Wall) ---
  const MiddleContent = (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-yellow-500/30 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🏆</span>
          <h2 className="text-xl font-bold text-white">Celebration Wall</h2>
        </div>
        <div className="flex items-center space-x-4">
          <Badge text="Status: Completed" color="green" />
          <Link to="/home" className="text-github-muted hover:text-white transition-colors" title="Close Celebration Wall">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-github-muted text-center py-10">Loading achievements...</p>
      ) : completedProjects.length === 0 ? (
        <Card className="text-center py-10 border-yellow-500/30">
          <p className="text-sm text-github-muted">No completed projects yet. Time to get building!</p>
        </Card>
      ) : (
        completedProjects.map(project => (
          <Link to={`/project/${project.id}`} key={project.id} className="block mb-4">
            <Card hoverable className="space-y-3 border border-yellow-500/30 bg-gradient-to-r from-[#161b22] to-[#1e1a12]">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar size="sm" />
                  <span className="font-semibold text-sm text-white">{project.authorUsername}-{project.title}</span>
                </div>
                <Badge text="Completed" color="green" />
              </div>
              <p className="text-sm text-github-text">{project.description}</p>
            </Card>
          </Link>
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
        <ThreePaneLayout left={LeftContent} middle={MiddleContent} right={RightContent} hideRight={!isChatOpen} />
      </div>
    </div>
  );
};