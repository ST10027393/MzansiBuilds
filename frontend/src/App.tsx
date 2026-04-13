import { useState } from 'react';
import api from './services/api';

function App() {
  const [responseMsg, setResponseMsg] = useState<string>("Waiting to test...");

  const testConnection = async () => {
    try {
      setResponseMsg("Pinging backend...");
      // Attempt to hit the protected auth endpoint
      const response = await api.get('/TestAuth/protected');
      setResponseMsg(`Success: ${response.status} - ${JSON.stringify(response.data)}`);
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        setResponseMsg("Connection Successful! Backend is alive and blocking unauthorized access (401).");
      } else {
        setResponseMsg(`Connection Failed: Is the C# server running? Error: ${error.message}`);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-github-dark text-github-text">
      <h1 className="text-4xl font-bold mb-4">MzansiBuilds Frontend</h1>
      
      <div className="bg-github-surface border border-github-border p-6 rounded-md shadow-lg text-center">
        <p className="mb-4 text-github-muted">{responseMsg}</p>
        
        <button 
          onClick={testConnection}
          className="bg-github-green hover:bg-github-greenHover text-white px-6 py-2 rounded-md font-semibold transition-colors"
        >
          Ping C# Backend
        </button>
      </div>
    </div>
  );
}

export default App;