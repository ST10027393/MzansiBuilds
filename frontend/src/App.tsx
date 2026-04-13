import { Navbar } from './components/layout/Navbar';
import { ThreePaneLayout } from './components/layout/ThreePaneLayout';
import { Card } from './components/common/Card';
import { Button } from './components/common/Button';
import { Avatar } from './components/common/Avatar';
import { Badge } from './components/common/Badge';

function App() {
  
  // ---------------------------------------------------------
  // LEFT PANE: Mini Profile & Project List
  // ---------------------------------------------------------
  const LeftContent = (
    <div className="space-y-6">
      {/* Mini Profile */}
      <div className="flex items-center space-x-3">
        <Avatar size="lg" />
        <div>
          <h2 className="font-bold text-lg leading-tight">Genius Muzama</h2>
          <p className="text-github-muted text-sm">genius-muzama</p>
        </div>
      </div>

      {/* Project Previews */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Your Projects</h3>
          <Button variant="primary" className="!py-1 !px-2 text-xs">New</Button>
        </div>
        <div className="space-y-2">
          <Card hoverable className="!p-3">
            <h4 className="font-semibold text-sm text-blue-400">genius-muzama/Ledgerly</h4>
            <p className="text-xs text-github-muted mt-1">Gamified budgeting application.</p>
          </Card>
          <Card hoverable className="!p-3">
            <h4 className="font-semibold text-sm text-blue-400">genius-muzama/MzansiBuilds</h4>
            <p className="text-xs text-github-muted mt-1">Full-stack developer platform.</p>
          </Card>
        </div>
      </div>
    </div>
  );

  // ---------------------------------------------------------
  // MIDDLE PANE: The Live Feed
  // ---------------------------------------------------------
  const MiddleContent = (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-github-border pb-3 mb-4">
        <h2 className="text-xl font-bold">Live Feed</h2>
        <div className="space-x-2">
          <Badge text="Filter: All" />
          <Badge text="Status: Active" />
        </div>
      </div>

      {/* Mock Feed Item 1 */}
      <Card hoverable className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Avatar size="sm" />
            <span className="font-semibold text-sm">keegan-b / WeatherClient</span>
          </div>
          <Badge text="Published" color="green" />
        </div>
        <p className="text-sm text-github-text">
          Integrating EskomSePush API for real-time utility tracking. Looking for help with the React frontend!
        </p>
        <div className="pt-2 border-t border-github-border flex space-x-2">
          <Button variant="secondary" className="!text-xs">Collaborate</Button>
          <Button variant="secondary" className="!text-xs">Comment (2)</Button>
        </div>
      </Card>

      {/* Mock Feed Item 2 */}
      <Card hoverable className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Avatar size="sm" />
            <span className="font-semibold text-sm">camden-a / AI-LifeSkills</span>
          </div>
          <Badge text="Draft" color="muted" />
        </div>
        <p className="text-sm text-github-text">
          Building a Generative AI tool to address life skills education gaps in South Africa.
        </p>
        <div className="pt-2 border-t border-github-border flex space-x-2">
          <Button variant="secondary" className="!text-xs">Collaborate</Button>
        </div>
      </Card>
    </div>
  );

  // ---------------------------------------------------------
  // RIGHT PANE: Chat Previews & Requests
  // ---------------------------------------------------------
  const RightContent = (
    <div className="space-y-6">
      {/* Collaboration Requests */}
      <div>
        <h3 className="font-semibold text-sm mb-3 text-github-muted">Pending Requests</h3>
        <Card className="!p-3 space-y-2 border-l-4 border-l-blue-500">
          <p className="text-xs">
            <span className="font-bold">Elishua Naidoo</span> wants to collaborate on <span className="font-bold">MzansiBuilds</span>
          </p>
          <div className="flex space-x-2 pt-1">
            <Button variant="primary" className="!py-0.5 !px-2 text-xs">Accept</Button>
            <Button variant="danger" className="!py-0.5 !px-2 text-xs">Decline</Button>
          </div>
        </Card>
      </div>

      {/* Recent Chats */}
      <div>
        <h3 className="font-semibold text-sm mb-3 text-github-muted">Recent Chats</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-github-surface cursor-pointer transition-colors">
            <Avatar size="sm" />
            <div className="flex-1 overflow-hidden">
              <h4 className="text-xs font-semibold">Tanya Muzama</h4>
              <p className="text-xs text-github-muted truncate">The database schema looks good!</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-github-surface cursor-pointer transition-colors">
            <Avatar size="sm" />
            <div className="flex-1 overflow-hidden">
              <h4 className="text-xs font-semibold">Kaiyur K</h4>
              <p className="text-xs text-github-muted truncate">Can you review my PR?</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ---------------------------------------------------------
  // RENDER THE SHELL
  // ---------------------------------------------------------
  return (
    <div className="min-h-screen bg-github-dark font-sans flex flex-col">
      {/* 1. The Persistent Navbar */}
      <Navbar />
      
      {/* 2. The 3-Pane Grid Structure */}
      <div className="flex-grow">
        <ThreePaneLayout 
          left={LeftContent} 
          middle={MiddleContent} 
          right={RightContent} 
        />
      </div>
    </div>
  );
}

export default App;