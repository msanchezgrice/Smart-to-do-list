import { useState, useEffect } from 'react';
import { Task } from '../types/task';
import { Settings, AIModel } from './Settings';
import { FiSettings, FiChevronDown, FiChevronUp } from 'react-icons/fi';

export function TaskView() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [newTask, setNewTask] = useState('');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showQuestionInput, setShowQuestionInput] = useState<Record<string, boolean>>({});
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

    const taskId = Date.now().toString();
    const task: Task = {
      id: taskId,
      title: newTask,
      completed: false,
      createdAt: new Date(),
      recommendations: []
    };

    setTasks([...tasks, task]);
    setNewTask('');

    // Get recommendations in the background
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task: newTask, model: aiModel }),
      });
      const data = await response.json();
      
      setTasks(currentTasks => 
        currentTasks.map(t => 
          t.id === taskId 
            ? { ...t, recommendations: data.recommendations } 
            : t
        )
      );
    } catch (error) {
      console.error('Error getting recommendations:', error);
    }
  };

  const handleAskQuestion = async (taskId: string) => {
    if (!question.trim()) return;

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question,
          tasks: [tasks.find(t => t.id === taskId)?.title || ''],
          model: aiModel
        }),
      });
      const data = await response.json();
      setAnswers(prev => ({ ...prev, [taskId]: data.answer }));
      setQuestion('');
      setShowQuestionInput(prev => ({ ...prev, [taskId]: false }));
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

      <div className="space-y-4">
        {tasks.map(task => (
          <div key={task.id} className="bg-white rounded-lg shadow-sm">
            <div className="flex items-center p-3">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTaskCompletion(task.id)}
                className="mr-3"
              />
              <span className={task.completed ? 'line-through text-gray-500' : ''}>
                {task.title}
              </span>
              {task.recommendations && task.recommendations.length > 0 && (
                <button
                  onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                  className="ml-auto flex items-center text-blue-600 hover:text-blue-700"
                >
                  {task.recommendations.length} recommendations
                  {expandedTaskId === task.id ? (
                    <FiChevronUp className="ml-1" />
                  ) : (
                    <FiChevronDown className="ml-1" />
                  )}
                </button>
              )}
            </div>

            {expandedTaskId === task.id && (
              <div className="p-3 border-t border-gray-100">
                <ul className="list-disc pl-5 space-y-2 mb-4">
                  {task.recommendations?.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>

                {!showQuestionInput[task.id] ? (
                  <button
                    onClick={() => setShowQuestionInput(prev => ({ ...prev, [task.id]: true }))}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Ask a Question
                  </button>
                ) : (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask a question about this task..."
                      className="w-full p-2 border border-gray-300 rounded-md mb-2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAskQuestion(task.id);
                        }
                      }}
                    />
                    {answers[task.id] && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-md">
                        {answers[task.id]}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
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