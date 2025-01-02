import { useState, useEffect } from 'react';
import { Task } from '../types/task';
import { Settings, AIModel } from './Settings';
import { FiSettings, FiTrash2, FiMenu } from 'react-icons/fi';
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
  const [editingRecommendations, setEditingRecommendations] = useState<{taskId: string, text: string} | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('aiModel', aiModel);
  }, [aiModel]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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
      const savedPrompt = localStorage.getItem('aiPrompt') || "You are a helpful task management assistant. Provide 3-5 specific, actionable recommendations for completing the given task. Each recommendation should be clear and concise.";
      
      const completion = await openai.chat.completions.create({
        model: aiModel,
        messages: [
          {
            role: "system",
            content: savedPrompt
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

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleEditRecommendations = (taskId: string, recommendations: string[]) => {
    setEditingRecommendations({ 
      taskId, 
      text: recommendations.join('\n') 
    });
  };

  const handleSaveRecommendations = () => {
    if (!editingRecommendations) return;

    setTasks(tasks.map(task => {
      if (task.id === editingRecommendations.taskId) {
        const newRecommendations = editingRecommendations.text
          .split('\n')
          .filter(line => line.trim());
        return { ...task, recommendations: newRecommendations };
      }
      return task;
    }));

    setEditingRecommendations(null);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-gray-100');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-gray-100');
  };

  const handleDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-gray-100');
    
    const draggedTaskId = e.dataTransfer.getData('text/plain');
    if (!draggedTaskId || draggedTaskId === targetTaskId) return;

    const draggedIndex = tasks.findIndex(t => t.id === draggedTaskId);
    const targetIndex = tasks.findIndex(t => t.id === targetTaskId);
    
    const newTasks = [...tasks];
    const [draggedItem] = newTasks.splice(draggedIndex, 1);
    newTasks.splice(targetIndex, 0, draggedItem);
    
    setTasks(newTasks);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white'}`}>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Smart To-Do List</h1>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`p-2 rounded-full ${
              darkMode 
                ? 'hover:bg-gray-800' 
                : 'hover:bg-gray-100'
            }`}
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
            className={`w-full p-4 text-lg border rounded-lg shadow-sm ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                : 'border-gray-200 placeholder-gray-500'
            }`}
          />
        </form>

        <div className="space-y-4">
          {tasks.map(task => (
            <div 
              key={task.id} 
              className={`rounded-lg shadow-sm ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, task.id)}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, task.id)}
            >
              <div className="flex items-center p-4">
                <div 
                  className={`cursor-grab mr-2 ${darkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                >
                  <FiMenu className="w-5 h-5" />
                </div>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTaskCompletion(task.id)}
                  className="w-5 h-5 mr-4"
                />
                <div className="flex-grow flex items-center justify-between">
                  <div>
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
                  {task.completed && (
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-red-600 hover:text-red-700 ml-4"
                      title="Delete task"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {expandedTaskId === task.id && (
                <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                  {editingRecommendations?.taskId === task.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingRecommendations.text}
                        onChange={(e) => setEditingRecommendations({
                          ...editingRecommendations,
                          text: e.target.value
                        })}
                        className={`w-full p-3 min-h-[150px] rounded-md border ${
                          darkMode 
                            ? 'bg-gray-800 text-white border-gray-700' 
                            : 'bg-white text-gray-900 border-gray-200'
                        }`}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingRecommendations(null)}
                          className={`px-3 py-1 ${
                            darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-500'
                          }`}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveRecommendations}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => handleEditRecommendations(task.id, task.recommendations || [])}
                      className={`cursor-pointer p-2 rounded-md ${
                        darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="space-y-2">
                        {task.recommendations?.map((rec, index) => (
                          <p key={index} className="font-normal" 
                             dangerouslySetInnerHTML={{ 
                               __html: rec
                                 .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                 .replace(/\n/g, '<br />') 
                             }} 
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {!showQuestionInput[task.id] ? (
                    <button
                      onClick={() => setShowQuestionInput(prev => ({ ...prev, [task.id]: true }))}
                      className="mt-4 text-blue-600 hover:text-blue-700"
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
          darkMode={darkMode}
          onDarkModeChange={setDarkMode}
        />
      </div>
    </div>
  );
} 