import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export const LandingPage: React.FC = () => {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Smart Todo List
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your tasks with AI-powered recommendations. Get personalized suggestions and break down complex goals into actionable steps.
          </p>
          <button
            onClick={() => signIn()}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Get Started Free
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-blue-600 text-2xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Smart Task Management</h3>
            <p className="text-gray-600">
              Organize your tasks with intelligent categorization and priority management.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-blue-600 text-2xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">AI Recommendations</h3>
            <p className="text-gray-600">
              Get personalized suggestions powered by GPT-4 to help you achieve your goals.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-blue-600 text-2xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2">Interactive Chat</h3>
            <p className="text-gray-600">
              Chat with AI to get detailed guidance and break down complex tasks.
            </p>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-semibold mb-8">Trusted by Busy Professionals</h2>
        <div className="flex justify-center space-x-8">
          <div className="text-gray-400">🏢 Enterprise Ready</div>
          <div className="text-gray-400">🔒 Secure & Private</div>
          <div className="text-gray-400">⚡ Real-time Updates</div>
        </div>
      </div>
    </div>
  );
}; 