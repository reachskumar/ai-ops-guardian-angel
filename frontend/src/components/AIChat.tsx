import React, { useState, useRef, useEffect } from 'react';
import aiServicesAPI from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatMeta {
  intent?: string;
  confidence?: number;
  requiresApproval?: boolean;
  actions?: Array<Record<string, any>>;
  suggestions?: string[];
  agentType?: string;
}

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [lastMeta, setLastMeta] = useState<ChatMeta | null>(null);
  const [sessionId] = useState<string>(() => {
    const existing = sessionStorage.getItem('chat_session_id');
    if (existing) return existing;
    const id = `sess-${Date.now()}`;
    sessionStorage.setItem('chat_session_id', id);
    return id;
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = { 
      text: input, 
      isUser: true, 
      timestamp: new Date() 
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Add loading message
    const loadingMessage: Message = { 
      text: '', 
      isUser: false, 
      timestamp: new Date(),
      isLoading: true 
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const resp = await aiServicesAPI.sendChatMessage({
        message: input,
        tenantId: user?.tenantId,
        sessionId,
        context: 'infrastructure_management',
      });
      if (resp.success) {
        const data: any = (resp as any).data || resp; // request wraps or forwards
        const text = (data && data.response) || 'AI response received';
        const aiMessage: Message = { 
          text: text, 
          isUser: false, 
          timestamp: new Date() 
        };
        setMessages(prev => prev.map(msg => msg.isLoading ? aiMessage : msg));
        setLastMeta({
          intent: data.intent,
          confidence: data.confidence,
          requiresApproval: data.requires_approval ?? data.requiresApproval,
          actions: data.actions,
          suggestions: data.suggestions,
          agentType: data.agent_type ?? data.agentType,
        });
      } else {
        throw new Error(resp.error || 'Chat failed');
      }
    } catch (error) {
      console.error('AI Service Error:', error);
      const errorMessage: Message = { 
        text: 'Error connecting to AI service. Please try again.', 
        isUser: false, 
        timestamp: new Date() 
      };
      setMessages(prev => prev.map(msg => 
        msg.isLoading ? errorMessage : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const resp = await aiServicesAPI.approveChat({ tenantId: user?.tenantId, sessionId, userId: user?.id });
      if (resp.success) {
        const data: any = (resp as any).data || resp;
        const text = (data && data.response) || 'Approved';
        const aiMessage: Message = { text, isUser: false, timestamp: new Date() };
        setMessages(prev => [...prev, aiMessage]);
        setLastMeta({
          intent: data.intent,
          confidence: data.confidence,
          requiresApproval: data.requires_approval ?? data.requiresApproval,
          actions: data.actions,
          suggestions: data.suggestions,
          agentType: data.agent_type ?? data.agentType,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const resp = await aiServicesAPI.cancelChat({ tenantId: user?.tenantId, sessionId, userId: user?.id });
      if (resp.success) {
        const data: any = (resp as any).data || resp;
        const text = (data && data.response) || 'Cancelled';
        const aiMessage: Message = { text, isUser: false, timestamp: new Date() };
        setMessages(prev => [...prev, aiMessage]);
        setLastMeta({
          intent: data.intent,
          confidence: data.confidence,
          requiresApproval: data.requires_approval ?? data.requiresApproval,
          actions: data.actions,
          suggestions: data.suggestions,
          agentType: data.agent_type ?? data.agentType,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedPrompts = [
    "Show me all my EC2 instances",
    "What's my current AWS spending?",
    "Create a new security group",
    "Scale my application to 3 instances",
    "Check the health of my load balancer",
    "Optimize my cloud costs"
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-card border rounded-lg shadow-lg h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <h1 className="text-3xl font-bold text-foreground">AI Infrastructure Assistant</h1>
          <p className="text-muted-foreground mt-2">
            Ask me to manage your cloud resources, optimize costs, or troubleshoot issues
          </p>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <div className="text-4xl mb-4">🤖</div>
              <p className="text-lg font-medium mb-2">Welcome to InfraMind</p>
              <p className="mb-4">I can help you manage your cloud infrastructure with natural language commands.</p>
              
              {/* Suggested Prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl mx-auto">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(prompt)}
                    className="p-3 text-left text-sm bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                msg.isUser 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-foreground'
              }`}>
                {msg.isLoading ? (
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </>
                )}
              </div>
            </div>
          ))}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div className="p-4 border-t">
          {lastMeta?.requiresApproval && (
            <div className="mb-3 p-3 border rounded bg-muted/40">
              <div className="text-sm mb-2">
                This action requires approval.
                {lastMeta.intent && (<span className="ml-1">Intent: <span className="font-medium">{lastMeta.intent}</span></span>)}
                {typeof lastMeta.confidence === 'number' && (<span className="ml-1">(confidence {Math.round(lastMeta.confidence * 100)}%)</span>)}
              </div>
              <div className="flex gap-2">
                <button onClick={handleApprove} className="px-3 py-2 bg-primary text-primary-foreground rounded">Approve</button>
                <button onClick={handleCancel} className="px-3 py-2 border rounded">Cancel</button>
              </div>
            </div>
          )}
          {lastMeta?.suggestions && lastMeta.suggestions.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-muted-foreground mb-1">Suggestions</div>
              <div className="flex flex-wrap gap-2">
                {lastMeta.suggestions.slice(0,4).map((sug, idx) => (
                  <button key={idx} onClick={() => setInput(sug)} className="px-2 py-1 text-xs border rounded">
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me to manage your cloud resources..."
              className="flex-1 p-3 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
          
          <div className="mt-2 text-xs text-muted-foreground">
            Examples: "Show my AWS costs", "Create a new EC2 instance", "Scale my application"
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat; 