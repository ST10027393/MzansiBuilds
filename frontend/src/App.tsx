import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
// Import layout shell (we'll assume you saved it as a component called Dashboard for now)
import { Dashboard } from './pages/Dashboard'; 

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
    </Routes>
  );
}

export default App;