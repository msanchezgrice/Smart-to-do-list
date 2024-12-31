import { supabase } from '../lib/supabase';
import { Task, TaskRecommendation } from '../types/task';

interface DbTask {
  id?: string;
  title?: string;
  description?: string;
  completed?: boolean;
  created_at?: Date;
  user_id?: string;
  recommendations?: TaskRecommendation[];
}

export async function getTasks(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createTask(task: Omit<Task, 'id'>): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert([{
      title: task.title,
      description: task.description,
      completed: task.completed,
      created_at: task.createdAt,
      user_id: task.userId,
      recommendations: task.recommendations
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
  const { userId, createdAt, ...rest } = updates;
  const dbUpdates: Partial<DbTask> = {
    ...rest,
    ...(userId && { user_id: userId }),
    ...(createdAt && { created_at: createdAt })
  };

  const { data, error } = await supabase
    .from('tasks')
    .update(dbUpdates)
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) throw error;
} 