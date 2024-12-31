export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  userId?: string; // Will be used when we add authentication
  recommendations?: TaskRecommendation[];
}

export interface TaskRecommendation {
  id: string;
  taskId: string;
  content: string;
  createdAt: Date;
  status: 'pending' | 'accepted' | 'rejected';
  userResponse?: string;
  aiResponse?: string;
} 