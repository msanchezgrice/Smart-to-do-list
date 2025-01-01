import { useState } from 'react';
import { Task } from '../types/task';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface Props {
  task: Task;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

export function TaskRecommendations({ task, onUpdateTask }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userQuestion, setUserQuestion] = useState('');

  const getRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a helpful task management assistant. Provide practical, actionable steps to help complete the task."
          },
          {
            role: "user",
            content: `Please provide recommendations for completing this task: "${task.title}"`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const recommendations = response.choices[0].message.content?.split('\n').filter(Boolean) || [];
      onUpdateTask(task.id, { recommendations });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!userQuestion.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a helpful task management assistant. Provide clear, practical answers to questions about the task."
          },
          {
            role: "user",
            content: `Regarding the task "${task.title}", ${userQuestion}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const answer = response.choices[0].message.content || '';
      const currentRecommendations = task.recommendations || [];
      onUpdateTask(task.id, {
        recommendations: [...currentRecommendations, `Q: ${userQuestion}`, `A: ${answer}`]
      });
      setUserQuestion('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get answer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!task.recommendations && (
        <button
          onClick={getRecommendations}
          disabled={loading}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {loading ? 'Getting recommendations...' : 'Get AI Recommendations'}
        </button>
      )}

      {task.recommendations && (
        <div className="space-y-2">
          {task.recommendations.map((rec, index) => (
            <div key={index} className="text-gray-700 text-sm">
              {rec}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 space-y-2">
        <input
          type="text"
          value={userQuestion}
          onChange={(e) => setUserQuestion(e.target.value)}
          placeholder="Ask a question about this task..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
        <button
          onClick={askQuestion}
          disabled={loading || !userQuestion.trim()}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Getting answer...' : 'Ask Question'}
        </button>
      </div>

      {error && (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );
} 