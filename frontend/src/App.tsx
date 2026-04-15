// FILE: frontend/src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
// Import layout shell 
import { Dashboard } from './pages/Dashboard'; 
import { CreateProject } from './pages/CreateProject';
import { ProjectDetails } from './pages/ProjectDetails';
import { Celebrations } from './pages/Celebrations';
import { Profile } from './pages/Profile';

// A wrapper that protects private routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  // If not logged in, kick them to the login page (Landing page)
  if (!currentUser) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <Routes>
      {/* Landing Page is Login */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes */}
      <Route 
        path="/home" 
        element={
          <ProtectedRoute>
            <Dashboard /> {/* This is where the ThreePaneLayout lives */}
          </ProtectedRoute>
        } 
      />

      {/* Project Routes */}
      <Route path="/new" element={<CreateProject />} />
      <Route path="/project/:id" element={<ProjectDetails />} />
      <Route path="/celebrations" element={<Celebrations />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/:id" element={<Profile />} />
    </Routes>
  );
}

export default App;