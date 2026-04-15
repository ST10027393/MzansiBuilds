// FILE: frontend/src/types/index.ts
export interface Milestone {
  id: string;
  title: string;
  isCompleted: boolean;
  orderIndex: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  repoLink: string;
  readme: string;
  status: 'Draft' | 'Published';
  authorEmail: string; // Used to check ownership
  authorUsername: string;
  milestones: Milestone[];
}