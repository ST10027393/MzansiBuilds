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

// NEW: Import Firebase auth methods
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
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', bio: '', name: '', surname: '' });

  // NEW: Security & Feedback States
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

        const projRes = await api.get(isOwner ? '/Projects/mine' : `/Projects/user/${targetUserId}`);
        setProjects(projRes.data);

        if (isOwner) {
            const reqRes = await api.get('/Friendship/requests');
            setFriendRequests(reqRes.data);
            
            const friendsRes = await api.get('/Friendship');
            setFriends(friendsRes.data);
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    };
    fetchProfileData();
  }, [targetUserId, isOwner]);

  // --- UPDATED: Profile Save Logic with Username Validation ---
  const handleSaveProfile = async () => {
    setProfileFeedback({ type: '', message: '' }); // Reset feedback
    try {
      await api.patch('/Users/profile', editForm);
      setProfileData({ ...profileData, ...editForm } as UserProfile);
      setProfileFeedback({ type: 'success', message: 'Profile updated successfully!' });
      
      // Auto-close edit mode after 1.5 seconds on success
      setTimeout(() => {
        setIsEditing(false);
        setProfileFeedback({ type: '', message: '' });
      }, 1500);
    } catch (e: any) {
      // Catch specific errors from C# backend (e.g., 409 Conflict or a 400 Bad Request)
      if (e.response?.status === 409 || e.response?.data?.toLowerCase().includes('taken')) {
        setProfileFeedback({ type: 'error', message: 'Username is already taken. Please try another.' });
      } else {
        setProfileFeedback({ type: 'error', message: 'Failed to update profile. Please try again.' });
      }
    }
  };

  // --- NEW: Password Change Logic ---
  const handlePasswordChange = async () => {
    setPasswordFeedback({ type: '', message: '' }); // Reset feedback

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
        // Firebase requires users to have logged in recently to change sensitive data
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

  // ... (Keep existing handleSendFriendRequest and handleRespondRequest untouched) ...
  const handleSendFriendRequest = async () => { /* untouched */ };
  const handleRespondRequest = async (requestId: number, accept: boolean) => { /* untouched */ };

  if (!profileData) return <div className="p-10 text-white text-center">Loading Profile...</div>;

  const LeftContent = ( /* untouched */
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-3 text-center border-b border-github-border pb-6">
        <Avatar size="lg" className="w-24 h-24" />
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
          <>
            <Button variant="primary" className="w-full" onClick={handleSendFriendRequest}>Add Friend</Button>
            <Button variant="danger" className="w-full mt-2 bg-transparent border-red-500 text-red-500 hover:bg-red-500 hover:text-white">Report User</Button>
          </>
        )}
      </div>
    </div>
  );

  // --- UPDATED: Middle Pane to include Feedback and Password UI ---
  const MiddleContent = isEditing ? (
    <div className="space-y-8 max-w-lg">
      
      {/* Profile Details Edit Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white border-b border-github-border pb-2">Edit Profile</h2>
        
        {/* Profile Feedback Banner */}
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

      {/* Security / Password Edit Section */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-white border-b border-github-border pb-2 text-red-400">Security</h2>
        
        {/* Password Feedback Banner */}
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
    // ... (Keep existing project rendering logic untouched)
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white border-b border-github-border pb-3">Projects</h2>
      {projects.length === 0 ? (
        <p className="text-github-muted text-sm">No projects found.</p>
      ) : (
        projects.map(project => (
          <Link to={`/project/${project.id}`} key={project.id} className="block mb-3">
            <Card hoverable className="border-l-2 border-l-blue-500">
              <h4 className="font-bold text-blue-400">{project.title}</h4>
              <p className="text-sm text-github-text mt-1 truncate">{project.description}</p>
            </Card>
          </Link>
        ))
      )}
    </div>
  );

  const RightContent = ( /* untouched */
    <div className="space-y-6">
      {isOwner && (
        <>
          <div>
            <h3 className="font-semibold text-sm text-white mb-3">Friend Requests</h3>
            {friendRequests.length === 0 ? <p className="text-xs text-github-muted">No pending requests.</p> : (
              friendRequests.map(req => (
                <Card key={req.id} className="!p-3 mb-2 space-y-2">
                  <p className="text-xs text-white font-bold">{req.requesterId} wants to connect.</p>
                  <div className="flex space-x-2">
                    <Button variant="primary" className="!py-0.5 !px-2 text-xs" onClick={() => handleRespondRequest(req.id, true)}>Accept</Button>
                    <Button variant="danger" className="!py-0.5 !px-2 text-xs" onClick={() => handleRespondRequest(req.id, false)}>Decline</Button>
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