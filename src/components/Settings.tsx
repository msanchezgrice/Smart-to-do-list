import { useState } from 'react';

export type AIModel = 'gpt-4' | 'gpt-4-0125-preview' | 'gpt-4-1106-preview';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentModel: AIModel;
  onModelChange: (model: AIModel) => void;
}

export function Settings({ isOpen, onClose, currentModel, onModelChange }: Props) {
  const [selectedModel, setSelectedModel] = useState<AIModel>(currentModel);

  const handleSave = () => {
    onModelChange(selectedModel);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Settings</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AI Model
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as AIModel)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-4-0125-preview">GPT-4 Turbo (January 2024)</option>
            <option value="gpt-4-1106-preview">GPT-4 Turbo (November 2023)</option>
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
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