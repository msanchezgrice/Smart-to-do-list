import OpenAI from 'openai';
import { openAIRateLimiter } from '../utils/rateLimiter';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function getTaskRecommendations(taskTitle: string): Promise<string[]> {
  await openAIRateLimiter.waitForToken();

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a helpful task management assistant. Provide 3-5 specific, actionable recommendations for completing the given task. Each recommendation should be clear and concise."
      },
      {
        role: "user",
        content: `Please provide recommendations for this task: ${taskTitle}`
      }
    ],
    model: "gpt-4",
  });

  const recommendations = completion.choices[0].message.content
    ?.split('\n')
    .filter(line => line.trim())
    .map(line => line.replace(/^\d+\.\s*/, '')) || [];

  return recommendations;
}

export async function getRecommendationResponse(
  taskTitle: string,
  recommendation: string,
  userMessage: string
): Promise<string> {
  await openAIRateLimiter.waitForToken();

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a helpful task management assistant. Provide detailed, actionable guidance based on the user's questions about task recommendations."
      },
      {
        role: "user",
        content: `Task: ${taskTitle}\nRecommendation: ${recommendation}\nQuestion: ${userMessage}`
      }
    ],
    model: "gpt-4",
  });

  return completion.choices[0].message.content || 'No response generated.';
} 