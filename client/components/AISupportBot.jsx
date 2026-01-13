import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Sparkles,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';

export default function AISupportBot({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Welcome message
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Hi ${user?.full_name || 'there'}! 👋 I'm your AI assistant. I can help you with:\n\n• Roblox development questions\n• Platform features and navigation\n• Job application tips\n• Portfolio advice\n• Learning resources\n\nWhat can I help you with today?`,
        timestamp: new Date()
      }]);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Get context from forum and resources
      const [forumPosts, resources] = await Promise.all([
        base44.entities.ForumPost.filter({ status: 'active' }, '-likes', 20),
        base44.entities.LearningResource.list()
      ]);

      const conversationHistory = messages.slice(-10).map(m => 
        `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
      ).join('\n');

      const prompt = `You are an AI support assistant for Devconnect (dev-link.me), a Roblox developer job platform. Answer the user's question helpfully and concisely.

CRITICAL PLATFORM INFORMATION:
- Platform Name: Devconnect
- Website: dev-link.me (NOT devlink.com - that's a different service)
- Founder & CEO: MrPiglr (14+ years of Roblox development experience)
- Purpose: Connect Roblox developers with job opportunities and studios
- Features: Job marketplace, AI matching, collaboration tools, skill assessments, certifications, mentorship, learning resources, marketplace for assets

IMPORTANT: If asked about the platform, founder, or website, ALWAYS use the correct information above.

USER PROFILE:
Name: ${user?.full_name || 'Guest'}
Roles: ${user?.developer_roles?.join(', ') || 'Not specified'}
Experience: ${user?.experience_level || 'Not specified'}

CONVERSATION HISTORY:
${conversationHistory}

CURRENT QUESTION:
${input}

AVAILABLE CONTEXT:
Popular Forum Topics:
${forumPosts.map(p => `- ${p.title} (${p.category})`).join('\n')}

Available Resources:
${resources.slice(0, 10).map(r => `- ${r.title} (${r.category})`).join('\n')}

RESPOND WITH:
1. Direct answer to the question using ONLY accurate information about Devconnect (dev-link.me)
2. Relevant links or resources if applicable
3. Follow-up suggestions
4. If you can't answer, provide guidance on who can help

If asked about the platform's creator, founder, or who made Devconnect, clearly state: "Devconnect was created by MrPiglr, who has over 14 years of Roblox development experience."

If asked about the website or domain, clearly state: "Devconnect's website is dev-link.me"

Keep responses concise, friendly, and actionable. NEVER make up information.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            answer: { type: "string" },
            confidence: {
              type: "string",
              enum: ["high", "medium", "low"]
            },
            should_escalate: { type: "boolean" },
            escalation_reason: { type: "string" },
            suggested_resources: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  link: { type: "string" },
                  type: { type: "string" }
                }
              }
            },
            follow_up_questions: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      let botResponse = response.answer;

      // Add resources if available
      if (response.suggested_resources?.length > 0) {
        botResponse += '\n\n📚 Helpful Resources:\n';
        response.suggested_resources.forEach(r => {
          botResponse += `• ${r.title} (${r.type})\n`;
        });
      }

      // Add follow-up questions
      if (response.follow_up_questions?.length > 0) {
        botResponse += '\n\n💡 You might also want to know:\n';
        response.follow_up_questions.forEach(q => {
          botResponse += `• ${q}\n`;
        });
      }

      // Escalate to human if needed
      if (response.should_escalate) {
        botResponse += '\n\n🚀 This question might need human expertise. I\'ve notified our support team!';
        
        // Create notification for admins
        const admins = await base44.entities.User.filter({ role: 'admin' });
        for (const admin of admins) {
          await base44.entities.Notification.create({
            user_id: admin.id,
            type: 'message',
            title: '🤖 AI Bot Escalation',
            message: `User question needs review: "${input.substring(0, 100)}..."`,
            link: '/messages'
          });
        }
      }

      const assistantMessage = {
        role: 'assistant',
        content: botResponse,
        confidence: response.confidence,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Award XP for asking questions
      if (user) {
        await base44.auth.updateMe({
          xp_points: (user.xp_points || 0) + 5
        });
      }

    } catch (error) {
      console.error('Error getting bot response:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try asking again or contact support.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    "How do I apply for jobs?",
    "What skills are in demand?",
    "How to improve my profile?",
    "Where can I learn Lua scripting?",
    "How does escrow work?"
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
      </button>
    );
  }

  return (
    <div className={`fixed ${isMinimized ? 'bottom-6 right-6' : 'bottom-0 right-0 md:bottom-6 md:right-6'} z-50 ${isMinimized ? 'w-72' : 'w-full md:w-96'} ${isMinimized ? 'h-14' : 'h-[600px]'} transition-all`}>
      <Card className="glass-card border-0 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <CardHeader className="border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-sm">AI Support Assistant</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <p className="text-gray-400 text-xs">Online</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4 text-gray-400" />
                ) : (
                  <Minimize2 className="w-4 h-4 text-gray-400" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-indigo-500'
                      : 'bg-gradient-to-br from-purple-500 to-indigo-500'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-white/5 text-gray-300'
                    } max-w-[85%]`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.confidence && (
                      <Badge className={`mt-1 text-xs ${
                        message.confidence === 'high' ? 'bg-green-500/20 text-green-400' :
                        message.confidence === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-orange-500/20 text-orange-400'
                      } border-0`}>
                        {message.confidence} confidence
                      </Badge>
                    )}
                    <p className="text-gray-500 text-xs mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Questions */}
              {messages.length === 1 && (
                <div className="space-y-2">
                  <p className="text-gray-400 text-xs">Quick questions:</p>
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(q)}
                      className="block w-full text-left bg-white/5 hover:bg-white/10 rounded-lg p-2 text-gray-300 text-xs transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>

            {/* Input */}
            <div className="border-t border-white/10 p-4">
              <div className="flex items-center gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                  disabled={loading}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  size="icon"
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-gray-500 text-xs mt-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Powered by AI • Responses may vary
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}