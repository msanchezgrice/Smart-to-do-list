import { useState, useEffect } from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';

export type AIModel = 'gpt-4' | 'gpt-4-0125-preview' | 'gpt-4-1106-preview';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentModel: AIModel;
  onModelChange: (model: AIModel) => void;
  darkMode: boolean;
  onDarkModeChange: (enabled: boolean) => void;
}

export function Settings({ 
  isOpen, 
  onClose, 
  currentModel, 
  onModelChange,
  darkMode,
  onDarkModeChange 
}: Props) {
  const [selectedModel, setSelectedModel] = useState<AIModel>(currentModel);
  const [prompt, setPrompt] = useState(() => {
    const savedPrompt = localStorage.getItem('aiPrompt');
    return savedPrompt || "You are a helpful task management assistant. Provide 3-5 specific, actionable recommendations for completing the given task. Each recommendation should be clear and concise.";
  });

  useEffect(() => {
    localStorage.setItem('aiPrompt', prompt);
  }, [prompt]);

  const handleSave = () => {
    onModelChange(selectedModel);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg p-6 w-96`}>
        <h2 className="text-xl font-bold mb-4">Settings</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              AI Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as AIModel)}
              className={`w-full p-2 border rounded-md ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'border-gray-300'
              }`}
            >
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4-0125-preview">GPT-4 Turbo (January 2024)</option>
              <option value="gpt-4-1106-preview">GPT-4 Turbo (November 2023)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              AI Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className={`w-full p-2 border rounded-md min-h-[100px] ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'border-gray-300'
              }`}
              placeholder="Enter the prompt for generating task recommendations..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Dark Mode
            </label>
            <button
              onClick={() => onDarkModeChange(!darkMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                darkMode 
                  ? 'bg-gray-700 text-white' 
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className={`px-4 py-2 ${
              darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
} 