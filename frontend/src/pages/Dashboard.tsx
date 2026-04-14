import { Navbar } from '../components/layout/Navbar';
import { ThreePaneLayout } from '../components/layout/ThreePaneLayout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';

export const Dashboard = () => {
  // Grab the real logged-in user from Firebase!
  const { currentUser } = useAuth();

  const LeftContent = (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Avatar size="lg" />
        <div>
          <h2 className="font-bold text-lg leading-tight text-white">
            {/* Display their real email while we wait to fetch their username from C# */}
            {currentUser?.email?.split('@')[0] || 'Developer'}
          </h2>
          <p className="text-github-muted text-sm">{currentUser?.email}</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-white">Your Projects</h3>
          <Button variant="primary" className="!py-1 !px-2 text-xs">New</Button>
        </div>
        <div className="space-y-2">
          <Card hoverable className="!p-3">
            <h4 className="font-semibold text-sm text-blue-400">Ledgerly</h4>
            <p className="text-xs text-github-muted mt-1">Gamified budgeting application.</p>
          </Card>
        </div>
      </div>
    </div>
  );

  const MiddleContent = (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-github-border pb-3 mb-4">
        <h2 className="text-xl font-bold text-white">Live Feed</h2>
        <div className="space-x-2">
          <Badge text="Filter: All" />
          <Badge text="Status: Active" />
        </div>
      </div>

      <Card hoverable className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Avatar size="sm" />
            <span className="font-semibold text-sm text-white">keegan-b / WeatherClient</span>
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
    </div>
  );

  const RightContent = (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-sm mb-3 text-github-muted">Pending Requests</h3>
        <Card className="!p-3 space-y-2 border-l-4 border-l-blue-500">
          <p className="text-xs text-github-text">
            <span className="font-bold text-white">Elishua Naidoo</span> wants to collaborate.
          </p>
          <div className="flex space-x-2 pt-1">
            <Button variant="primary" className="!py-0.5 !px-2 text-xs">Accept</Button>
            <Button variant="danger" className="!py-0.5 !px-2 text-xs">Decline</Button>
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-github-dark font-sans flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <ThreePaneLayout left={LeftContent} middle={MiddleContent} right={RightContent} />
      </div>
    </div>
  );
};