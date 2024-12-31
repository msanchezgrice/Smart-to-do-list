import { useAuth } from './contexts/AuthContext';
import { LandingPage } from './components/LandingPage';
import { Settings } from './components/Settings';
import { useState, useEffect } from 'react';
import { Task } from './types/task';
import { getTasks, createTask, updateTask, deleteTask } from './services/tasks';
import { TaskRecommendations } from './components/TaskRecommendations';

function TaskView() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    if (!user) return;
    try {
      const loadedTasks = await getTasks(user.id);
      setTasks(loadedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const addTask = async () => {
    if (!user || !newTaskTitle.trim()) return;
    try {
      const newTask = await createTask({
        title: newTaskTitle,
        completed: false,
        userId: user.id,
        createdAt: new Date(),
      });
      setTasks([newTask, ...tasks]);
      setNewTaskTitle('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    try {
      const updatedTask = await updateTask(taskId, {
        completed: !task.completed
      });
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const removeTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error removing task:', error);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await updateTask(taskId, updates);
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Smart Todo List</h1>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-gray-600 hover:text-gray-900"
          >
            ⚙️ Settings
          </button>
        </div>
      </nav>

      {showSettings ? (
        <Settings />
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex gap-4">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add a new task..."
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                onClick={addTask}
                disabled={!newTaskTitle.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Add Task
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-lg shadow-sm p-4"
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <h3 className={`text-lg ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-gray-600 mt-1">{task.description}</p>
                    )}
                    <div className="mt-2 space-x-2">
                      <button
                        onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        {expandedTask === task.id ? 'Hide Recommendations' : 'Show Recommendations'}
                      </button>
                      <button
                        onClick={() => removeTask(task.id)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                {expandedTask === task.id && (
                  <div className="mt-4 pl-8">
                    <TaskRecommendations task={task} onUpdateTask={handleUpdateTask} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleNavigation = async () => {
      // Check if we're at the callback URL
      const isCallback = window.location.pathname.includes('/callback');
      if (isCallback) {
        setIsLoading(false);
        return;
      }

      // Wait a bit to ensure auth state is settled
      await new Promise(resolve => setTimeout(resolve, 1000));

      // If user is authenticated and not at /app, redirect to /app
      if (user && window.location.pathname !== '/app') {
        window.location.replace('/app');
        return;
      }
      
      // If user is not authenticated and at /app, redirect to root
      if (!user && window.location.pathname === '/app') {
        window.location.replace('/');
        return;
      }

      setIsLoading(false);
    };

    handleNavigation();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show TaskView only if user is authenticated and at /app
  if (user && window.location.pathname === '/app') {
    return <TaskView />;
  }

  // Otherwise show LandingPage
  return <LandingPage />;
}

export default App;
