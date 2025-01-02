import { useState, useEffect } from 'react';
import { Task } from '../types/task';
import { Settings, AIModel } from './Settings';
import { FiSettings } from 'react-icons/fi';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

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
      const completion = await openai.chat.completions.create({
        model: aiModel,
        messages: [
          {
            role: "system",
            content: "You are a helpful task management assistant. Provide 3-5 specific, actionable recommendations for completing the given task. Each recommendation should be clear and concise."
          },
          {
            role: "user",
            content: `Please provide recommendations for this task: ${newTask}`
          }
        ]
      });
      
      const recommendations = completion.choices[0].message.content
        ?.split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.\s*/, '')) || [];

      setTasks(currentTasks => 
        currentTasks.map(t => 
          t.id === taskId 
            ? { ...t, recommendations } 
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
      const completion = await openai.chat.completions.create({
        model: aiModel,
        messages: [
          {
            role: "system",
            content: "You are a helpful task management assistant. Provide clear, practical answers to questions about the task."
          },
          {
            role: "user",
            content: `Regarding the task "${tasks.find(t => t.id === taskId)?.title}", ${question}`
          }
        ]
      });
      
      const answer = completion.choices[0].message.content || '';
      setAnswers(prev => ({ ...prev, [taskId]: answer }));
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
          className="w-full p-4 text-lg border border-gray-200 rounded-lg shadow-sm"
        />
      </form>

      <div className="space-y-4">
        {tasks.map(task => (
          <div key={task.id} className="bg-white rounded-lg shadow-sm">
            <div className="flex items-center p-4">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTaskCompletion(task.id)}
                className="w-5 h-5 mr-4"
              />
              <div className="flex-grow">
                <span className={task.completed ? 'line-through text-gray-500' : ''}>
                  {task.title}
                </span>
                <button
                  onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                  className="ml-2 text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md text-sm"
                >
                  {(task.recommendations || []).length > 0 
                    ? `${(task.recommendations || []).length} recommendations` 
                    : 'Loading...'}
                </button>
              </div>
            </div>

            {expandedTaskId === task.id && (
              <div className="p-4 border-t border-gray-100">
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