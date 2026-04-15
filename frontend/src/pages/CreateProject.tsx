// FILE: frontend/src/pages/CreateProject.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import api from '../services/api';

export const CreateProject = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ title: '', description: '', repoLink: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // FIX: Added '/draft' to match the [HttpPost("draft")] in C# controller
      const response = await api.post('/Projects/draft', formData);
      navigate(`/project/${response.data.id}`);
    } catch (err: any) {
      console.error("Failed to create project", err);
      setError("Failed to create project. Check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // FIX: Removed 'items-center pt-20' from the main wrapper so the Navbar spans 100% width!
    <div className="min-h-screen bg-github-dark flex flex-col font-sans">
      <Navbar />
      
      {/* FIX: Created a new centered wrapper strictly for the form content */}
      <div className="flex-grow flex flex-col items-center px-4 mt-10">
        <div className="w-full max-w-2xl">
          <h1 className="text-2xl font-semibold text-white mb-6">Create a new project</h1>
          
          <Card className="!p-6 space-y-4">
            {error && (
              <div className="bg-github-danger bg-opacity-20 border border-github-danger text-github-text px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input 
                label="Project Title" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                required 
                placeholder="e.g., MzansiBuilds Frontend"
              />
              <div className="flex flex-col w-full">
                <label htmlFor="description" className="mb-1 text-sm font-semibold text-github-text">Short Description</label>
                <textarea 
                  id="description" 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  required
                  className="bg-github-dark border border-github-border rounded-md px-3 py-2 text-github-text text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none h-24"
                />
              </div>
              <Input 
                label="Repository URL (Optional)" 
                type="url"
                value={formData.repoLink} 
                onChange={e => setFormData({...formData, repoLink: e.target.value})} 
                placeholder="https://github.com/username/repo"
              />
              <div className="pt-4 border-t border-github-border flex justify-end">
                {/* FIX: Explicitly added type="submit" so the form actually fires! */}
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};