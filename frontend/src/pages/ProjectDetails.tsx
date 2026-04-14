import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { ThreePaneLayout } from '../components/layout/ThreePaneLayout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import type { Project, Milestone } from '../types';
import api from '../services/api';

// New Interfaces for dynamic data
interface Comment {
  id: string;
  username: string;
  text: string;
}

interface CollabRequest {
  id: string;
  username: string;
}

export const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [collabRequests, setCollabRequests] = useState<CollabRequest[]>([]);
  
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch all data from database on load
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const res = await api.get(`/Projects/${id}`);
        setProject(res.data);
        setMilestones((res.data.milestones || []).sort((a: any, b: any) => a.orderIndex - b.orderIndex));

        // Fetch Comments dynamically
        const commentsRes = await api.get(`/Projects/${id}/comments`).catch(() => ({ data: [] }));
        setComments(commentsRes.data);

        // Fetch Collab Requests ONLY if the viewer is the owner
        if (currentUser?.email === res.data.authorEmail) {
          const reqRes = await api.get(`/Projects/${id}/collaborators/requests`).catch(() => ({ data: [] }));
          setCollabRequests(reqRes.data);
        }
      } catch (error) {
        console.error("Project not found");
        navigate('/home');
      } finally {
        setLoading(false);
      }
    };
    fetchProjectData();
  }, [id, navigate, currentUser?.email]);

  if (loading || !project) return <div className="p-10 text-white text-center">Loading...</div>;

  const isOwner = currentUser?.email === project.authorEmail;

  // --- API Handlers ---
  const handlePublish = async () => {
    await api.put(`/Projects/${id}/status`, { status: 'Published' });
    setProject({ ...project, status: 'Published' });
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure?")) {
      await api.delete(`/Projects/${id}`);
      navigate('/home');
    }
  };

  const addMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle) return;
    const newMilestone = { title: newMilestoneTitle, isCompleted: false, orderIndex: milestones.length };
    const res = await api.post(`/Projects/${id}/milestones`, newMilestone);
    setMilestones([...milestones, res.data]);
    setNewMilestoneTitle('');
  };

  const toggleMilestone = async (mId: string, currentStatus: boolean) => {
    await api.put(`/Projects/${id}/milestones/${mId}`, { isCompleted: !currentStatus });
    setMilestones(milestones.map(m => m.id === mId ? { ...m, isCompleted: !currentStatus } : m));
  };

  // --- NEW: Social API Handlers ---
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText) return;
    const res = await api.post(`/Projects/${id}/comments`, { text: newCommentText });
    setComments([...comments, res.data]); // Append new comment locally
    setNewCommentText('');
  };

  const handleCollabAction = async (reqId: string, action: 'accept' | 'decline') => {
    await api.put(`/Projects/${id}/collaborators/requests/${reqId}`, { action });
    // Remove the request from the pending list
    setCollabRequests(collabRequests.filter(req => req.id !== reqId));
  };

  const handleRequestCollab = async () => {
    await api.post(`/Projects/${id}/collaborators/requests`);
    alert("Collaboration request sent!");
  };

  // --- LEFT PANE: Milestones ---
  const LeftContent = (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm text-white border-b border-github-border pb-2">Milestones</h3>
      {isOwner && (
        <form onSubmit={addMilestone} className="flex space-x-2">
          <input 
            value={newMilestoneTitle} onChange={e => setNewMilestoneTitle(e.target.value)}
            placeholder="New milestone..." 
            className="flex-1 bg-github-dark border border-github-border rounded-md px-2 py-1 text-xs text-github-text outline-none focus:border-blue-500"
          />
          <Button type="submit" variant="secondary" className="!py-1 !px-2 text-xs">+</Button>
        </form>
      )}
      <div className="space-y-2">
        {milestones.map((m) => (
          <div key={m.id} className="flex items-center justify-between bg-[#161b22] p-2 rounded border border-github-border">
            <div className="flex items-center space-x-3">
              <input 
                type="checkbox" 
                checked={m.isCompleted} 
                onChange={() => toggleMilestone(m.id, m.isCompleted)}
                disabled={!isOwner}
                className="w-4 h-4 rounded border-gray-600 bg-gray-700"
              />
              <span className={`text-sm ${m.isCompleted ? 'line-through text-github-muted' : 'text-github-text'}`}>
                {m.title}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // --- MIDDLE PANE: Main Content ---
  const MiddleContent = (
    <div className="space-y-4">
      <div className="flex justify-between items-start border-b border-github-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">{project.authorUsername} / {project.title}</h1>
          <p className="text-github-muted text-sm mt-1">{project.description}</p>
        </div>
        <Badge text={project.status} color={project.status === 'Published' ? 'green' : 'gray'} />
      </div>

      <Card className="!p-6 min-h-[300px]">
        {isOwner ? (
          <textarea 
            className="w-full h-full min-h-[250px] bg-transparent text-github-text resize-none outline-none"
            defaultValue={project.readme || "Add a README to describe your project..."}
            onBlur={(e) => api.put(`/Projects/${id}`, { readme: e.target.value })}
          />
        ) : (
          <p className="text-github-text whitespace-pre-wrap">{project.readme || "No README provided."}</p>
        )}
      </Card>
    </div>
  );

  // --- RIGHT PANE: Actions, Comments & Collabs ---
  const RightContent = (
    <div className="space-y-8">
      
      {/* 1. Core Actions */}
      <div>
        <h3 className="font-semibold text-sm text-white border-b border-github-border pb-2 mb-3">Actions</h3>
        {isOwner ? (
          <div className="space-y-2">
            {project.status === 'Draft' && (
              <Button variant="primary" className="w-full" onClick={handlePublish}>🚀 Publish Project</Button>
            )}
            <Button variant="secondary" className="w-full">⚙️ Settings</Button>
            <Button variant="danger" className="w-full mt-4" onClick={handleDelete}>🗑️ Delete</Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Button variant="primary" className="w-full" onClick={handleRequestCollab}>🤝 Request Collaboration</Button>
            {project.repoLink && (
              <a href={project.repoLink} target="_blank" rel="noreferrer" className="block w-full text-center border border-github-border text-github-text py-1.5 rounded-md text-sm hover:bg-github-surface transition-colors">
                View Repository
              </a>
            )}
          </div>
        )}
      </div>

      {/* 2. Comments Section */}
      <div>
        <h3 className="font-semibold text-sm text-white border-b border-github-border pb-2 mb-3">Comments</h3>
        <div className="space-y-3 mb-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
          {comments.length === 0 ? (
            <p className="text-xs text-github-muted italic">No comments yet.</p>
          ) : (
            comments.map(c => (
              <div key={c.id} className="bg-[#161b22] p-2 rounded border border-github-border">
                <span className="font-bold text-xs text-blue-400">{c.username}</span>
                <p className="text-xs text-github-text mt-1">{c.text}</p>
              </div>
            ))
          )}
        </div>
        
        {/* Add Comment Form */}
        <form onSubmit={handleAddComment} className="flex space-x-2">
          <input 
            value={newCommentText} onChange={e => setNewCommentText(e.target.value)}
            placeholder="Add a comment..." 
            className="flex-1 bg-github-dark border border-github-border rounded-md px-2 py-1 text-xs text-github-text outline-none focus:border-blue-500"
          />
          <Button type="submit" variant="secondary" className="!py-1 !px-2 text-xs">Post</Button>
        </form>
      </div>

      {/* 3. Collab Requests (OWNERS ONLY) */}
      {isOwner && (
        <div>
          <h3 className="font-semibold text-sm text-white border-b border-github-border pb-2 mb-3">Collab Requests</h3>
          <div className="space-y-2">
            {collabRequests.length === 0 ? (
              <p className="text-xs text-github-muted italic">No pending requests.</p>
            ) : (
              collabRequests.map(req => (
                <Card key={req.id} className="!p-2 border-l-4 border-l-blue-500">
                  <p className="text-xs text-github-text"><span className="font-bold text-white">{req.username}</span> wants to join.</p>
                  <div className="flex space-x-2 pt-2">
                    <Button onClick={() => handleCollabAction(req.id, 'accept')} variant="primary" className="!py-0.5 !px-2 text-xs">Accept</Button>
                    <Button onClick={() => handleCollabAction(req.id, 'decline')} variant="danger" className="!py-0.5 !px-2 text-xs">Decline</Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );

  return (
    <div className="min-h-screen bg-github-dark flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <ThreePaneLayout left={LeftContent} middle={MiddleContent} right={RightContent} />
      </div>
    </div>
  );
};