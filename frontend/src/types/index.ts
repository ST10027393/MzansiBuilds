import type { JSX } from "react/jsx-runtime";

// FILE: frontend/src/types/index.ts
export interface Milestone {
  id: string;
  title: string;
  isCompleted: boolean;
  orderIndex: number;
}

export interface Project {
  authorId: any;
  map(arg0: (c: any) => JSX.Element): import("react").ReactNode;
  length: number;
  some(arg0: (c: any) => boolean): any;
  collaborators: Project | null;
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