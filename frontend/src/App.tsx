import { Button } from './components/common/Button';
import { Card } from './components/common/Card';
import { Input } from './components/common/Input';
import { Badge } from './components/common/Badge';
import { Avatar } from './components/common/Avatar';

function App() {
  return (
    <div className="min-h-screen p-10 max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold border-b border-github-border pb-2">UI Component Library</h1>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Buttons</h2>
        <div className="flex space-x-4">
          <Button variant="primary">Publish Project</Button>
          <Button variant="secondary">Edit Profile</Button>
          <Button variant="danger">Delete Repository</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Inputs</h2>
        <Input label="Repository name" placeholder="MzansiBuilds" />
        <Input label="Description (optional)" placeholder="A short description of your project..." />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Cards & Badges</h2>
        <Card hoverable className="flex items-start justify-between">
          <div className="flex space-x-3">
            <Avatar />
            <div>
              <h3 className="font-semibold text-github-text hover:text-blue-400 cursor-pointer">genius-muzama/MzansiBuilds</h3>
              <p className="text-sm text-github-muted">Building a fullstack developer platform.</p>
            </div>
          </div>
          <Badge text="Published" color="green" />
        </Card>
      </section>
    </div>
  );
}

export default App;