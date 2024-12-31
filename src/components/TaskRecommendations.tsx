import { useState } from 'react';
import { Task, TaskRecommendation } from '../types/task';
import { getTaskRecommendations, getRecommendationResponse } from '../services/ai';

interface TaskRecommendationsProps {
  task: Task;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
}

export function TaskRecommendations({ task, onUpdateTask }: TaskRecommendationsProps) {
  const [loading, setLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [selectedRecommendation, setSelectedRecommendation] = useState<TaskRecommendation | null>(null);

  const loadRecommendations = async () => {
    if (task.recommendations?.length) return;
    
    setLoading(true);
    try {
      const recommendations = await getTaskRecommendations(task.title);
      const taskRecommendations: TaskRecommendation[] = recommendations.map(content => ({
        id: crypto.randomUUID(),
        taskId: task.id,
        content,
        createdAt: new Date(),
        status: 'pending'
      }));

      await onUpdateTask(task.id, { recommendations: taskRecommendations });
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendationAction = async (recommendation: TaskRecommendation, status: 'accepted' | 'rejected') => {
    const updatedRecommendations = task.recommendations?.map(r =>
      r.id === recommendation.id ? { ...r, status } : r
    );

    await onUpdateTask(task.id, { recommendations: updatedRecommendations });
  };

  const handleSendMessage = async () => {
    if (!selectedRecommendation || !chatMessage.trim()) return;

    setLoading(true);
    try {
      const aiResponse = await getRecommendationResponse(
        task.title,
        selectedRecommendation.content,
        chatMessage
      );

      const updatedRecommendations = task.recommendations?.map(r =>
        r.id === selectedRecommendation.id
          ? { ...r, userResponse: chatMessage, aiResponse }
          : r
      );

      await onUpdateTask(task.id, { recommendations: updatedRecommendations });
      setChatMessage('');
      setSelectedRecommendation(null);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!task.recommendations && !loading) {
    return (
      <button
        onClick={loadRecommendations}
        className="text-sm text-blue-500 hover:text-blue-600"
      >
        Get Recommendations
      </button>
    );
  }

  if (loading) {
    return <div className="text-sm text-gray-500">Loading recommendations...</div>;
  }

  return (
    <div className="mt-4 space-y-4">
      {task.recommendations?.map((recommendation) => (
        <div
          key={recommendation.id}
          className="bg-gray-50 rounded-lg p-4 space-y-2"
        >
          <p className="text-gray-800">{recommendation.content}</p>
          
          {recommendation.status === 'pending' ? (
            <div className="flex gap-2">
              <button
                onClick={() => handleRecommendationAction(recommendation, 'accepted')}
                className="text-sm text-green-500 hover:text-green-600"
              >
                Accept
              </button>
              <button
                onClick={() => handleRecommendationAction(recommendation, 'rejected')}
                className="text-sm text-red-500 hover:text-red-600"
              >
                Reject
              </button>
              <button
                onClick={() => setSelectedRecommendation(recommendation)}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                Ask Question
              </button>
            </div>
          ) : (
            <div className="text-sm">
              Status: <span className={recommendation.status === 'accepted' ? 'text-green-500' : 'text-red-500'}>
                {recommendation.status}
              </span>
            </div>
          )}

          {selectedRecommendation?.id === recommendation.id && (
            <div className="mt-2 space-y-2">
              <textarea
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask a question about this recommendation..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSelectedRecommendation(null)}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!chatMessage.trim()}
                  className="px-3 py-1 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {recommendation.userResponse && (
            <div className="mt-2 space-y-1">
              <div className="text-sm text-gray-600">
                Your question: {recommendation.userResponse}
              </div>
              {recommendation.aiResponse && (
                <div className="text-sm text-blue-600">
                  AI Response: {recommendation.aiResponse}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 