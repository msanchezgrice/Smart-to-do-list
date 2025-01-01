import { useState, useEffect } from 'react';
import { Task } from '../types/task';
import { Settings, AIModel } from './Settings';
import { FiSettings } from 'react-icons/fi';

export function TaskView() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [newTask, setNewTask] = useState('');
  const [showQuestion, setShowQuestion] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [aiModel, setAIModel] = useState<AIModel>(() => {
    const savedModel = localStorage.getItem('aiModel');
    return (savedModel as AIModel) || 'gpt-4';
  });

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('aiModel', aiModel);
  }, [aiModel]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask,
      completed: false,
      createdAt: new Date(),
    };

    setTasks([...tasks, task]);
    setNewTask('');

    // Automatically get AI recommendations
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task: newTask, model: aiModel }),
      });
      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error('Error getting recommendations:', error);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question,
          tasks: tasks.map(t => t.title),
          model: aiModel
        }),
      });
      const data = await response.json();
      setAnswer(data.answer);
      setQuestion('');
      setShowQuestion(false);
    } catch (error) {
      console.error('Error asking question:', error);
    }
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Smart To-Do List</h1>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <FiSettings className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleAddTask} className="mb-6">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="w-full p-2 border border-gray-300 rounded-md mb-2"
        />
      </form>

      <div className="space-y-4 mb-6">
        {tasks.map(task => (
          <div
            key={task.id}
            className="flex items-center p-3 bg-white rounded-lg shadow-sm"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTaskCompletion(task.id)}
              className="mr-3"
            />
            <span className={task.completed ? 'line-through text-gray-500' : ''}>
              {task.title}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {recommendations.length > 0 && (
          <div>
            <button
              onClick={() => setShowRecommendations(!showRecommendations)}
              className="text-blue-600 hover:text-blue-700"
            >
              {recommendations.length} recommendations
            </button>
            {showRecommendations && (
              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                <ul className="list-disc pl-5 space-y-2">
                  {recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div>
          <button
            onClick={() => setShowQuestion(!showQuestion)}
            className="text-blue-600 hover:text-blue-700"
          >
            Ask Question
          </button>
          {showQuestion && (
            <form onSubmit={handleAskQuestion} className="mt-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about your tasks..."
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </form>
          )}
          {answer && (
            <div className="mt-2 p-4 bg-gray-50 rounded-lg">
              {answer}
            </div>
          )}
        </div>
      </div>

      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentModel={aiModel}
        onModelChange={setAIModel}
      />
    </div>
  );
} 