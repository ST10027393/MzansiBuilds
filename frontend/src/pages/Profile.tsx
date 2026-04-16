import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { ThreePaneLayout } from '../components/layout/ThreePaneLayout';
import { Card } from '../components/common/Card';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useGlobalState } from '../context/GlobalStateContext';
import api from '../services/api';

import { updatePassword } from 'firebase/auth';
import { auth } from '../services/firebase'; 

interface UserProfile {
  id: string;
  username: string;
  bio: string;
  name: string;
  surname: string;
}

export const Profile = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const { isChatOpen } = useGlobalState();

  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [friendStatus, setFriendStatus] = useState<'None' | 'Pending' | 'Friends' | 'Blocked'>('None');
  const [collabRequests, setCollabRequests] = useState<any[]>([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', bio: '', name: '', surname: '' });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileFeedback, setProfileFeedback] = useState({ type: '', message: '' });
  const [passwordFeedback, setPasswordFeedback] = useState({ type: '', message: '' });

  const isOwner = Boolean(currentUser && (!id || currentUser.uid === id));
  const targetUserId = id || currentUser?.uid;

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!targetUserId) return;
      
      try {
        const userRes = await api.get(`/Users/${targetUserId}`);
        setProfileData(userRes.data);
        setEditForm({ 
            username: userRes.data.username, 
            bio: userRes.data.bio, 
            name: userRes.data.name, 
            surname: userRes.data.surname 
        });

        // Fetches your projects AND collaborations
        const projRes = await api.get(isOwner ? '/Projects/mine' : `/Projects/user/${targetUserId}`);
        setProjects(projRes.data);

        if (isOwner) {
            const reqRes = await api.get('/Friendship/requests');
            setFriendRequests(reqRes.data);
            
            const friendsRes = await api.get('/Friendship');
            setFriends(friendsRes.data);

            const statusRes = await api.get(`/Friendship/status/${targetUserId}`).catch(() => ({ data: { status: 'None' } }));
            setFriendStatus(statusRes.data.status);

            const collabRes = await api.get('/Collaboration/requests/pending').catch(() => ({ data: [] }));
            setCollabRequests(collabRes.data);
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    };
    fetchProfileData();
  }, [targetUserId, isOwner]);

  const handleSaveProfile = async () => {
    setProfileFeedback({ type: '', message: '' });
    try {
      await api.patch('/Users/profile', editForm);
      setProfileData({ ...profileData, ...editForm } as UserProfile);
      setProfileFeedback({ type: 'success', message: 'Profile updated successfully!' });
      setTimeout(() => {
        setIsEditing(false);
        setProfileFeedback({ type: '', message: '' });
      }, 1500);
    } catch (e: any) {
      if (e.response?.status === 409 || e.response?.data?.toLowerCase().includes('taken')) {
        setProfileFeedback({ type: 'error', message: 'Username is already taken. Please try another.' });
      } else {
        setProfileFeedback({ type: 'error', message: 'Failed to update profile. Please try again.' });
      }
    }
  };

  const handlePasswordChange = async () => {
    setPasswordFeedback({ type: '', message: '' });

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordFeedback({ type: 'error', message: 'Weak password. Must be at least 6 characters.' });
      return;
    }

    if (auth.currentUser) {
      try {
        await updatePassword(auth.currentUser, newPassword);
        setPasswordFeedback({ type: 'success', message: 'Password updated successfully!' });
        setNewPassword('');
        setConfirmPassword('');
      } catch (error: any) {
        if (error.code === 'auth/requires-recent-login') {
          setPasswordFeedback({ type: 'error', message: 'For security reasons, please log out and log back in to change your password.' });
        } else if (error.code === 'auth/weak-password') {
            setPasswordFeedback({ type: 'error', message: 'Password is too weak.' });
        } else {
          setPasswordFeedback({ type: 'error', message: error.message || 'Failed to update password.' });
        }
      }
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      await api.post(`/Friendship/${targetUserId}/request`);
      alert("Friend request sent!");
    } catch (e: any) {
      alert(e.response?.data || "Failed to send request.");
    }
  };

  // FIX: Restored the actual logic here so TS stops throwing unused variable errors!
  const handleRespondRequest = async (requestId: number, accept: boolean) => {
    try {
      await api.patch(`/Friendship/${requestId}/respond`, { accept });
      setFriendRequests(friendRequests.filter(req => req.id !== requestId));
    } catch (e) {
      console.error("Failed to respond to request", e);
    }
  };

  const handleRespondCollab = async (requestId: number, accept: boolean) => {
    try {
      await api.patch(`/Collaboration/requests/${requestId}/respond`, { accept });
      setCollabRequests(collabRequests.filter(req => req.id !== requestId));
    } catch (e) {
      console.error("Failed to respond to collab request", e);
    }
  };

  if (!profileData) return <div className="p-10 text-white text-center">Loading Profile...</div>;

  const LeftContent = (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-3 text-center border-b border-github-border pb-6">
        {/* FIX: Removed invalid className prop */}
        <Avatar size="lg" />
        <div>
          <h2 className="font-bold text-xl text-white">{profileData.name} {profileData.surname}</h2>
          <p className="text-github-muted text-sm">@{profileData.username}</p>
        </div>
        <p className="text-sm text-github-text mt-2">{profileData.bio || "No bio provided."}</p>
      </div>

      <div className="space-y-3">
        {isOwner ? (
          <Button variant="secondary" className="w-full" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Cancel Edit" : "Edit Profile"}
          </Button>
        ) : (
          <div className="space-y-2 w-full">
            {friendStatus === 'None' && (
              <Button variant="primary" className="w-full" onClick={handleSendFriendRequest}>Add Friend</Button>
            )}
            {friendStatus === 'Pending' && (
              <Button variant="secondary" className="w-full opacity-50 cursor-not-allowed" disabled>Request Sent</Button>
            )}
            {friendStatus === 'Friends' && (
              <div className="flex flex-col space-y-2 w-full">
                <Button variant="primary" className="w-full bg-blue-600 border-none hover:bg-blue-500">💬 Message</Button>
                <div className="flex space-x-2">
                  <Button variant="secondary" className="flex-1 !text-xs" onClick={() => friends.find(f => (f.requesterId === currentUser?.uid ? f.addresseeId : f.requesterId) === id) && handleRespondRequest(friends.find(f => (f.requesterId === currentUser?.uid ? f.addresseeId : f.requesterId) === id)?.id, false)}>Remove</Button>
                  <Button variant="danger" className="flex-1 !text-xs">Block</Button>
                </div>
              </div>
            )}
            <Button variant="danger" className="w-full bg-transparent border-red-500 text-red-500 hover:bg-red-500 hover:text-white mt-4">Report User</Button>
          </div>
        )}
      </div>
    </div>
  );

  const MiddleContent = isEditing ? (
    <div className="space-y-8 max-w-lg">
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white border-b border-github-border pb-2">Edit Profile</h2>
        {profileFeedback.message && (
          <div className={`p-2 rounded text-xs border ${profileFeedback.type === 'error' ? 'bg-red-900/30 text-red-400 border-red-800' : 'bg-green-900/30 text-green-400 border-green-800'}`}>
            {profileFeedback.message}
          </div>
        )}
        <div className="space-y-2">
            <label className="text-xs text-github-muted font-semibold">Username</label>
            <input value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value})} placeholder="Username" className="w-full bg-github-dark border border-github-border rounded p-2 text-sm text-white focus:border-blue-500 outline-none" />
        </div>
        <div className="flex space-x-2">
            <div className="flex-1 space-y-2">
                <label className="text-xs text-github-muted font-semibold">First Name</label>
                <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="First Name" className="w-full bg-github-dark border border-github-border rounded p-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div className="flex-1 space-y-2">
                <label className="text-xs text-github-muted font-semibold">Last Name</label>
                <input value={editForm.surname} onChange={e => setEditForm({...editForm, surname: e.target.value})} placeholder="Last Name" className="w-full bg-github-dark border border-github-border rounded p-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
        </div>
        <div className="space-y-2">
            <label className="text-xs text-github-muted font-semibold">Bio</label>
            <textarea value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} placeholder="Tell the community about yourself..." className="w-full bg-github-dark border border-github-border rounded p-2 text-sm text-white h-24 focus:border-blue-500 outline-none" />
        </div>
        <Button variant="primary" onClick={handleSaveProfile}>Save Profile Settings</Button>
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-white border-b border-github-border pb-2 text-red-400">Security</h2>
        {passwordFeedback.message && (
          <div className={`p-2 rounded text-xs border ${passwordFeedback.type === 'error' ? 'bg-red-900/30 text-red-400 border-red-800' : 'bg-green-900/30 text-green-400 border-green-800'}`}>
            {passwordFeedback.message}
          </div>
        )}
        <div className="space-y-2">
            <label className="text-xs text-github-muted font-semibold">New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 6 characters" className="w-full bg-github-dark border border-github-border rounded p-2 text-sm text-white focus:border-red-500 outline-none" />
        </div>
        <div className="space-y-2">
            <label className="text-xs text-github-muted font-semibold">Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" className="w-full bg-github-dark border border-github-border rounded p-2 text-sm text-white focus:border-red-500 outline-none" />
        </div>
        <Button variant="danger" onClick={handlePasswordChange}>Update Password</Button>
      </div>
    </div>
  ) : (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white border-b border-github-border pb-3">Projects</h2>
      {projects.length === 0 ? (
        <p className="text-github-muted text-sm">No projects found.</p>
      ) : (
        projects.map(project => (
          <Link to={`/project/${project.id}`} key={project.id} className="block mb-3">
            <Card hoverable className="border-l-2 border-l-blue-500">
              {/* FIX: Displays ownerUsername-ProjectTitle formatting! */}
              <h4 className="font-bold text-blue-400">{project.authorUsername}-{project.title}</h4>
              <p className="text-sm text-github-text mt-1 truncate">{project.description}</p>
            </Card>
          </Link>
        ))
      )}
    </div>
  );

  const RightContent = (
    <div className="space-y-6">
      {isOwner && (
        <>
          <div>
            <h3 className="font-semibold text-sm text-white mb-3">Friend Requests</h3>
            {friendRequests.length === 0 ? <p className="text-xs text-github-muted">No pending requests.</p> : (
              friendRequests.map(req => (
                <Card key={req.id} className="!p-3 mb-2 space-y-2">
                  <p className="text-xs text-white font-bold"><Link to={`/profile/${req.requesterId}`} className="font-bold text-blue-400 hover:underline">
                      {req.requesterId}
                    </Link> wants to connect.</p>
                  <div className="flex space-x-2">
                    <Button variant="primary" className="!py-0.5 !px-2 text-xs" onClick={() => handleRespondRequest(req.id, true)}>Accept</Button>
                    <Button variant="danger" className="!py-0.5 !px-2 text-xs" onClick={() => handleRespondRequest(req.id, false)}>Decline</Button>
                  </div>
                </Card>
              ))
            )}
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white mb-3 mt-4 text-blue-400">Collab Requests</h3>
            {collabRequests.length === 0 ? <p className="text-xs text-github-muted">No pending collaborations.</p> : (
              collabRequests.map(req => (
                <Card key={req.id} className="!p-3 mb-2 space-y-2 border-l-2 border-l-blue-500">
                  <p className="text-xs text-white">
                    <span className="font-bold"><Link to={`/profile/${req.username}`} className="font-bold text-blue-400 hover:underline">
                      {req.username}
                    </Link></span> wants to join <span className="font-bold italic">{req.projectTitle}</span>.
                  </p>
                  <div className="flex space-x-2">
                    <Button variant="primary" className="!py-0.5 !px-2 text-xs" onClick={() => handleRespondCollab(req.id, true)}>Accept</Button>
                    <Button variant="danger" className="!py-0.5 !px-2 text-xs" onClick={() => handleRespondCollab(req.id, false)}>Decline</Button>
                  </div>
                </Card>
              ))
            )}
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white mb-3">Friends List</h3>
            {friends.length === 0 ? <p className="text-xs text-github-muted">You haven't added any friends yet.</p> : (
              friends.map(friend => (
                <div key={friend.id} className="flex items-center space-x-2 mb-2 p-2 hover:bg-github-surface rounded cursor-pointer">
                  {/* FIX: Removed invalid className prop */}
                  <Avatar size="sm" />
                  <span className="text-sm text-github-text">{friend.requesterId === currentUser?.uid ? friend.addresseeId : friend.requesterId}</span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-github-dark flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <ThreePaneLayout left={LeftContent} middle={MiddleContent} right={RightContent} hideRight={!isChatOpen} />
      </div>
    </div>
  );
};