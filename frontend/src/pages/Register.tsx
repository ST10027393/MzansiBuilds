import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

export const Register = () => {
  const [formData, setFormData] = useState({ name: '', surname: '', username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);

    try {
      // 1. Create the user in Firebase Auth
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);

      // 2. Sync the user to your C# Database
      await api.post('/Users/sync', {
        email: formData.email,
        username: formData.username,
        name: formData.name,
        surname: formData.surname
      });

      navigate('/home');

    } catch (err: any) {
      console.error("FULL REGISTRATION ERROR:", err); // Logs to browser console
      
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please log in.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Firebase Error: Email/Password login is not enabled in your Firebase Console.');
      } else if (err.response) {
        // This catches C# backend errors (like 500 Database errors or 400 Bad Requests)
        setError(`Backend Error: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
      } else {
        // Fallback that shows the EXACT system error instead of a generic one
        setError(`System Error: ${err.message || 'Unknown error occurred.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-github-dark flex flex-col items-center justify-center p-4 py-10">
      
      <div className="mb-6 text-center flex flex-col items-center">
        <svg className="w-12 h-12 mb-4" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" rx="20" fill="#161b22" stroke="#30363d" strokeWidth="4"/>
          <text x="50" y="68" fontSize="48" fontWeight="bold" fill="#c9d1d9" textAnchor="middle" fontFamily="sans-serif">mb</text>
        </svg>
        <h1 className="text-2xl font-light text-github-text">Create your account</h1>
      </div>

      <Card className="w-full max-w-md !bg-[#161b22] !p-6">
        {error && (
          <div className="bg-github-danger bg-opacity-20 border border-github-danger text-github-text px-4 py-3 rounded mb-4 text-sm break-words">
            {error}
          </div>
        )}
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" name="name" value={formData.name} onChange={handleChange} required />
            <Input label="Last Name" name="surname" value={formData.surname} onChange={handleChange} required />
          </div>
          <Input label="Username" name="username" value={formData.username} onChange={handleChange} required />
          <Input label="Email address" type="email" name="email" value={formData.email} onChange={handleChange} required />
          <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} required />
          <Input label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
          
          <Button variant="primary" className="w-full mt-4" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up'}
          </Button>
        </form>
      </Card>

      <p className="mt-4 text-github-muted text-sm border border-github-border p-4 rounded-md w-full max-w-md text-center">
        Already have an account? <Link to="/" className="text-blue-400 hover:underline">Sign in.</Link>
      </p>
    </div>
  );
};