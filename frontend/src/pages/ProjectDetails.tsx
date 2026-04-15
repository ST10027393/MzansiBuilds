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
import { Avatar } from '../components/common/Avatar';

interface Comment { id: string; username: string; text: string; }
interface CollabRequest { id: string; username: string; }

export const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [collabRequests, setCollabRequests] = useState<CollabRequest[]>([]);
  const [collabStatus, setCollabStatus] = useState<string | null>(null);
  
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // NEW: State to track if the viewer has a pending request
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  
  const [editForm, setEditForm] = useState({ title: '', description: '', readme: '' });

  useEffect(() => {
    if (!currentUser) return;
    const fetchProjectData = async () => {
      try {
        const res = await api.get(`/Projects/${id}`);
        setProject(res.data);
        
        setEditForm({ 
            title: res.data.title, 
            description: res.data.description, 
            readme: res.data.readme || '' 
        });
        
        setMilestones((res.data.milestones || []).sort((a: any, b: any) => a.orderIndex - b.orderIndex));

        const commentsRes = await api.get(`/Projects/${id}/comments`).catch(() => ({ data: [] }));
        setComments(commentsRes.data);

        // Fetch requests if owner
        if (currentUser?.email === res.data.authorEmail || currentUser?.email?.split('@')[0] === res.data.authorUsername) {
          const reqRes = await api.get(`/Collaboration/requests/pending`).catch(() => ({ data: [] }));
          setCollabRequests(reqRes.data.filter((r: any) => r.projectId.toString() === id));
        }

        if (currentUser) {
          const myReqsRes = await api.get(`/Collaboration/requests/sent`).catch(() => ({ data: [] }));
          const myReq = myReqsRes.data.find((r: any) => r.projectId.toString() === id);
          if (myReq) setCollabStatus(myReq.status); // "Pending", "Declined", or "Accepted"
        }
      } catch (error) {
        console.error("Project not found");
        navigate('/home');
      } finally {
        setLoading(false);
      }
    };
    fetchProjectData();
  }, [id, navigate, currentUser]);

  const isOwner = Boolean(
    currentUser && project && (
      (currentUser.uid && currentUser.uid === (project as any).authorId) || 
      (currentUser.uid && currentUser.uid === (project as any).ownerId) ||
      (currentUser.email && currentUser.email === project.authorEmail) ||
      (currentUser.email && project.authorUsername && currentUser.email.split('@')[0] === project.authorUsername)
    )
  );

  const isCompleted = (project?.status as string) === 'Completed';

  const isCollaborator = Boolean(
    currentUser && project && project.collaborators && 
    project.collaborators.some((c: any) => c.userId === currentUser.uid)
  );

  const canEdit = isOwner || isCollaborator;

  // --- API Handlers: Status Changes ---
  const handlePublish = async () => {
    try {
      await api.patch(`/Projects/${id}/publish`);
      setProject({ ...project!, status: 'Published' });
    } catch (error: any) {
      alert(error.response?.data || "Failed to publish project.");
    }
  };

  const handleComplete = async () => {
    if (window.confirm("Are you sure you want to mark this project as Completed? This locks milestones and collaborations.")) {
      try {
        await api.patch(`/Projects/${id}/complete`);
        setProject({ ...project!, status: 'Completed' as any });
      } catch (error: any) {
        alert(error.response?.data || "Failed to complete project.");
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure? This cannot be undone.")) {
      await api.delete(`/Projects/${id}`);
      navigate('/home');
    }
  };

  const handleSaveEdits = async () => {
    try {
      await api.put(`/Projects/${id}`, editForm);
      setProject({ ...project!, ...editForm });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save edits", error);
      alert("Failed to save. Make sure your backend HttpPut endpoint is running!");
    }
  };

  // --- API Handlers: Milestones ---
  const addMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle || isCompleted) return; 
    const res = await api.post(`/Projects/${id}/milestones`, { title: newMilestoneTitle, isCompleted: false, orderIndex: milestones.length });
    setMilestones([...milestones, res.data]);
    setNewMilestoneTitle('');
  };

  const toggleMilestone = async (mId: string, currentStatus: boolean) => {
    if (isCompleted) return; 
    await api.put(`/Projects/${id}/milestones/${mId}`, { isCompleted: !currentStatus });
    setMilestones(milestones.map(m => m.id === mId ? { ...m, isCompleted: !currentStatus } : m));
  };

  const moveMilestone = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === milestones.length - 1)) return;
    const newMilestones = [...milestones];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newMilestones[index];
    newMilestones[index] = newMilestones[targetIndex];
    newMilestones[targetIndex] = temp;
    setMilestones(newMilestones);
    try {
      await api.put(`/Projects/${id}/milestones/reorder`, newMilestones);
    } catch(e) { console.error("Failed to reorder", e); }
  };

  // --- API Handlers: Social Engine ---
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText) return;
    const res = await api.post(`/Projects/${id}/comments`, { text: newCommentText });
    setComments([...comments, res.data]);
    setNewCommentText('');
  };

  const handleRequestCollab = async () => {
    try {
      await api.post(`/Collaboration/${id}/request`, { PitchMessage: "I would love to help!" });
      setHasPendingRequest(true); // Visually update the button
    } catch (error: any) {
      // If the backend says "already requested", update the UI to match
      if (error.response?.data?.includes("already requested")) {
        setHasPendingRequest(true);
      } else {
        alert(error.response?.data || "Failed to send request.");
      }
    }
  };

  // NEW: Real handler for the Owner to accept/decline from the Project page
  const handleRespondCollab = async (requestId: string, accept: boolean) => {
    try {
      await api.patch(`/Collaboration/requests/${requestId}/respond`, { accept });
      // Instantly remove it from the UI queue
      setCollabRequests(collabRequests.filter(req => req.id !== requestId));
      
      // If accepted, fetch the project again to refresh the Collaborators List
      if (accept) {
        const res = await api.get(`/Projects/${id}`);
        setProject(res.data);
      }
    } catch (e) {
      console.error("Failed to respond to collab request", e);
    }
  };

  if (loading || !project) return <div className="p-10 text-white text-center">Loading...</div>;

  // --- LEFT PANE ---
  const LeftContent = (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm text-white border-b border-github-border pb-2">Milestones</h3>
      
      {canEdit && !isEditing && !isCompleted && (
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
        {milestones.length === 0 && <p className="text-xs text-github-muted italic">No milestones yet.</p>}
        {milestones.map((m, index) => (
          <div key={m.id} className="flex items-center justify-between bg-[#161b22] p-2 rounded border border-github-border group">
            <div className="flex items-center space-x-3">
              <input 
                type="checkbox" 
                checked={m.isCompleted} 
                onChange={() => toggleMilestone(m.id, m.isCompleted)}
                disabled={!canEdit || isEditing || isCompleted} 
                className="w-4 h-4 rounded border-gray-600 bg-gray-700 disabled:opacity-50 cursor-pointer"
              />
              <span className={`text-sm ${m.isCompleted ? 'line-through text-github-muted' : 'text-github-text'} ${isCompleted ? 'opacity-75' : ''}`}>
                {m.title}
              </span>
            </div>
            
            {canEdit && !isEditing && !isCompleted && (
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => moveMilestone(index, 'up')} className="text-github-muted hover:text-white text-[10px]">▲</button>
                <button onClick={() => moveMilestone(index, 'down')} className="text-github-muted hover:text-white text-[10px]">▼</button>
                <button onClick={async () => {
                    await api.delete(`/Projects/${id}/milestones/${m.id}`);
                    setMilestones(milestones.filter(milestone => milestone.id !== m.id));
                }} className="text-red-500 hover:text-red-400 text-xs ml-2">✕</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // --- MIDDLE PANE ---
  const MiddleContent = (
    <div className="space-y-4">
      <div className="flex justify-between items-start border-b border-github-border pb-4">
        {isEditing ? (
          <div className="flex-1 mr-4 space-y-2">
             <input 
               value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})}
               className="w-full bg-github-dark border border-github-border rounded-md px-3 py-2 text-lg font-bold text-blue-400 focus:outline-none focus:border-blue-500"
             />
             <textarea 
               value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})}
               className="w-full bg-github-dark border border-github-border rounded-md px-3 py-2 text-sm text-github-text focus:outline-none focus:border-blue-500 h-20 resize-none"
             />
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold text-blue-400">{project.authorUsername} / {project.title}</h1>
            <p className="text-github-muted text-sm mt-1">{project.description}</p>
          </div>
        )}
        <Badge text={project.status} color={isCompleted ? 'green' : (project.status === 'Published' ? 'muted' : undefined)} />
      </div>

      {/* Collaborators List - Now Visible via Backend Fix! */}
        {project.collaborators && project.collaborators.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-github-muted self-center font-semibold">Collaborators:</span>
            {project.collaborators.map((c: any) => (
              <div key={c.id} className="flex items-center space-x-1 bg-github-surface px-2 py-1 rounded border border-github-border">
                <Avatar size="sm"/>
                <span className="text-xs text-github-text font-bold">{c.user?.username || c.userId}</span>
              </div>
            ))}
          </div>
        )}

      <Card className="!p-6 min-h-[300px]">
        {isEditing ? (
          <div className="flex flex-col h-full space-y-2">
            <label className="text-sm font-semibold text-github-muted">Edit README.md</label>
            <textarea 
              className="w-full h-full min-h-[250px] bg-github-dark border border-github-border rounded text-github-text resize-y outline-none focus:border-blue-500 p-3"
              value={editForm.readme}
              onChange={(e) => setEditForm({...editForm, readme: e.target.value})}
              placeholder="Add a README to describe your project..."
            />
          </div>
        ) : (
          <p className="text-github-text whitespace-pre-wrap">{project.readme || "No README provided."}</p>
        )}
      </Card>
    </div>
  );

  // --- RIGHT PANE ---
  const RightContent = (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold text-sm text-white border-b border-github-border pb-2 mb-3">Actions</h3>
        {canEdit ? (
          <div className="space-y-2">
            {isEditing ? (
              <>
                <Button variant="primary" className="w-full" onClick={handleSaveEdits}>💾 Save Changes</Button>
                <Button variant="danger" className="w-full" onClick={() => setIsEditing(false)}>❌ Discard</Button>
              </>
            ) : (
              <>
                <Button variant="secondary" className="w-full" onClick={() => setIsEditing(true)}>✏️ Edit Project</Button>
                
                {/* Only the true owner should be able to complete or delete */}
                {isOwner && project.status === 'Draft' && (
                  <Button variant="primary" className="w-full" onClick={handlePublish}>🚀 Publish Project</Button>
                )}
                {isOwner && project.status === 'Published' && (
                  <Button variant="primary" className="w-full !bg-green-600 hover:!bg-green-500 !border-transparent" onClick={handleComplete}>🏆 Mark as Complete</Button>
                )}
                {isOwner && (
                  <Button variant="danger" className="w-full mt-4" onClick={handleDelete}>🗑️ Delete Project</Button>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {isCompleted ? (
              <div className="bg-green-900/30 text-green-400 border border-green-800 text-xs text-center py-2 rounded">
                This project is completed.
              </div>
            ) : collabStatus === 'Pending' || hasPendingRequest ? (
              <Button variant="secondary" className="w-full !opacity-50 cursor-not-allowed" disabled>⏳ Request Pending</Button>
            ) : collabStatus === 'Declined' ? (
              <Button variant="danger" className="w-full" onClick={handleRequestCollab}>↻ Request Declined (Try Again)</Button>
            ) : (
              <Button variant="primary" className="w-full" onClick={handleRequestCollab}>🤝 Request Collaboration</Button>
            )}
            
            {project.repoLink && (
              <a href={project.repoLink} target="_blank" rel="noreferrer" className="block w-full text-center border border-github-border text-github-text py-1.5 rounded-md text-sm hover:bg-github-surface transition-colors">
                View Repository
              </a>
            )}
          </div>
        )}
      </div>

      {!isEditing && (
        <>
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
            <form onSubmit={handleAddComment} className="flex space-x-2">
              <input 
                value={newCommentText} onChange={e => setNewCommentText(e.target.value)}
                placeholder="Add a comment..." 
                className="flex-1 bg-github-dark border border-github-border rounded-md px-2 py-1 text-xs text-github-text outline-none focus:border-blue-500"
              />
              <Button type="submit" variant="secondary" className="!py-1 !px-2 text-xs">Post</Button>
            </form>
          </div>

          {isOwner && (
            <div>
              <h3 className="font-semibold text-sm text-white border-b border-github-border pb-2 mb-3">Collab Requests</h3>
              <div className="space-y-2">
                {collabRequests.length === 0 ? (
                  <p className="text-xs text-github-muted italic">No pending requests.</p>
                ) : (
                  collabRequests.map((req: any) => (
                    <Card key={req.id} className="!p-2 border-l-4 border-l-blue-500">
                      <p className="text-xs text-github-text"><span className="font-bold text-white">{req.username}</span> wants to join.</p>
                      <div className="flex space-x-2 pt-2">
                        {/* 2. REPLACED EMPTY ONCLICKS WITH REAL LOGIC */}
                        <Button onClick={() => handleRespondCollab(req.id, true)} variant="primary" className="!py-0.5 !px-2 text-xs">Accept</Button>
                        <Button onClick={() => handleRespondCollab(req.id, false)} variant="danger" className="!py-0.5 !px-2 text-xs">Decline</Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </>
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