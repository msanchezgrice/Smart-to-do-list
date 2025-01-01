import { Task } from '../types/task';

export async function getTasks(_userId: string): Promise<Task[]> {
  // In a real app, this would fetch from a database
  return [];
}

export async function createTask(task: Omit<Task, 'id'>): Promise<Task> {
  // In a real app, this would save to a database
  return {
    ...task,
    id: Date.now().toString()
  };
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
  // In a real app, this would update in a database
  return {
    id: taskId,
    title: 'Updated Task',
    completed: false,
    userId: 'demo-user',
    createdAt: new Date(),
    ...updates
  };
}

export async function deleteTask(_taskId: string): Promise<void> {
  // In a real app, this would delete from a database
} 