import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/home'); // On success, redirect to the 3-pane dashboard
    } catch (err: any) {
      // Translate Firebase errors into user-friendly feedback
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        setError('Incorrect email or password.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError('Failed to log in. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-github-dark flex flex-col items-center justify-center p-4">
      <div className="mb-6 text-center">
        {/* GitHub style cat/logo placeholder */}
        <svg className="w-12 h-12 mb-4" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" rx="20" fill="#161b22" stroke="#30363d" strokeWidth="4"/>
          <text x="50" y="68" fontSize="48" fontWeight="bold" fill="#c9d1d9" textAnchor="middle" fontFamily="sans-serif">mb</text>
        </svg>
        <h1 className="text-2xl font-light text-github-text">Sign in to MzansiBuilds</h1>
      </div>

      <Card className="w-full max-w-sm !bg-[#161b22] !p-6">
        {error && (
          <div className="bg-github-danger bg-opacity-20 border border-github-danger text-github-text px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <Input 
            label="Email address" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <Input 
            label="Password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <Button variant="primary" className="w-full mt-2" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </Card>

      <p className="mt-4 text-github-muted text-sm border border-github-border p-4 rounded-md w-full max-w-sm text-center">
        New to MzansiBuilds? <Link to="/register" className="text-blue-400 hover:underline">Create an account.</Link>
      </p>
    </div>
  );
};