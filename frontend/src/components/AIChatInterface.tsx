import { useState, useRef, useEffect } from "react";
import { 
  MessageCircle, 
  Send, 
  Paperclip, 
  Bot, 
  User, 
  Mic, 
  MicOff,
  X,
  Minimize2,
  Maximize2,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  agentType?: string;
}

interface AIAgent {
  id: string;
  name: string;
  specialty: string;
  color: string;
  description: string;
}

const aiAgents: AIAgent[] = [
  { id: '1', name: 'CostOptimizer', specialty: 'Cost Management', color: 'bg-success', description: 'Analyzes and optimizes cloud costs' },
  { id: '2', name: 'SecurityGuard', specialty: 'Security', color: 'bg-destructive', description: 'Monitors and enhances security posture' },
  { id: '3', name: 'AutoScaler', specialty: 'Performance', color: 'bg-primary', description: 'Manages resource scaling and performance' },
  { id: '4', name: 'ComplianceBot', specialty: 'Compliance', color: 'bg-warning', description: 'Ensures regulatory compliance' },
  { id: '5', name: 'DeployMaster', specialty: 'DevOps', color: 'bg-accent', description: 'Handles deployments and CI/CD' },
  { id: '6', name: 'MonitorAI', specialty: 'Monitoring', color: 'bg-azure', description: 'Real-time infrastructure monitoring' },
  { id: '7', name: 'BackupBot', specialty: 'Data Protection', color: 'bg-aws', description: 'Automated backup and recovery' },
  { id: '8', name: 'NetworkOptim', specialty: 'Networking', color: 'bg-gcp', description: 'Network optimization and routing' },
];

interface AIChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

const AIChatInterface = ({ isOpen, onClose, isMinimized, onToggleMinimize }: AIChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your InfraMind AI assistant. I have access to 28 specialized agents to help you manage your multi-cloud infrastructure. How can I assist you today?',
      sender: 'ai',
      timestamp: new Date(),
      agentType: 'General Assistant'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    try {
      // Send message to AI service
      const response = await fetch('http://localhost:8001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessage,
          user_id: 'demo_user',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response || getAIResponse(newMessage),
          sender: 'ai',
          timestamp: new Date(),
          agentType: selectedAgent?.name || 'General Assistant'
        };
        setMessages(prev => [...prev, aiResponse]);
      } else {
        // Fallback to simulated response
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: getAIResponse(newMessage),
          sender: 'ai',
          timestamp: new Date(),
          agentType: selectedAgent?.name || 'General Assistant'
        };
        setMessages(prev => [...prev, aiResponse]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback to simulated response
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(newMessage),
        sender: 'ai',
        timestamp: new Date(),
        agentType: selectedAgent?.name || 'General Assistant'
      };
      setMessages(prev => [...prev, aiResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const getAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('cost') || input.includes('expense') || input.includes('budget')) {
      return `I've analyzed your cloud costs across all providers. Based on your current usage patterns, I can identify $2,340 in monthly savings opportunities. Would you like me to implement the top 3 optimization strategies automatically?`;
    }
    
    if (input.includes('security') || input.includes('vulnerability') || input.includes('threat')) {
      return `Security scan completed! I found 3 medium-priority vulnerabilities and 1 compliance issue. All can be auto-remediated. Your current security score is 94.2%. Shall I proceed with the security fixes?`;
    }
    
    if (input.includes('deploy') || input.includes('pipeline') || input.includes('ci/cd')) {
      return `Your deployment pipeline is running smoothly! Last deployment: 2 hours ago with 99.8% success rate. I notice you could optimize build times by 40% with parallel processing. Want me to configure that?`;
    }
    
    return `I understand you're asking about "${userInput}". Let me connect you with the most relevant AI agent for this query. Based on your question, I recommend consulting with our ${selectedAgent?.name || 'specialized agents'}. How would you like to proceed?`;
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      content: 'Chat cleared! How can I help you with your infrastructure management today?',
      sender: 'ai',
      timestamp: new Date(),
      agentType: 'General Assistant'
    }]);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${isMinimized ? 'w-80' : 'w-96'} transition-all duration-300`}>
      <Card className="infra-card shadow-glow border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between p-4 bg-gradient-primary text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <CardTitle className="text-lg">InfraMind AI Assistant</CardTitle>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleMinimize}
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0">
            {/* Agent Selection */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Active Agents</span>
                <Button variant="ghost" size="sm" onClick={clearChat}>
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {aiAgents.slice(0, 4).map((agent) => (
                  <Badge 
                    key={agent.id}
                    variant={selectedAgent?.id === agent.id ? "default" : "secondary"}
                    className={`cursor-pointer text-xs ${selectedAgent?.id === agent.id ? 'bg-primary text-primary-foreground' : ''}`}
                    onClick={() => setSelectedAgent(agent)}
                  >
                    {agent.name}
                  </Badge>
                ))}
                <Badge variant="outline" className="text-xs">
                  +{aiAgents.length - 4} more
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="h-80 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.sender === 'user' 
                          ? 'bg-primary ml-2' 
                          : 'bg-accent mr-2'
                      }`}>
                        {message.sender === 'user' ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className={`rounded-lg p-3 ${
                        message.sender === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        {message.agentType && message.sender === 'ai' && (
                          <div className="text-xs text-muted-foreground mb-1">
                            {message.agentType}
                          </div>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <span className="text-xs opacity-70 mt-2 block">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleFileUpload}
                  className="h-10 w-10"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Ask about your infrastructure..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="pr-10"
                  />
                </div>
                <Button
                  variant={isVoiceMode ? "destructive" : "ghost"}
                  size="icon"
                  onClick={() => setIsVoiceMode(!isVoiceMode)}
                  className="h-10 w-10"
                >
                  {isVoiceMode ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  variant="gradient"
                  size="icon"
                  className="h-10 w-10"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              {selectedAgent && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Active: {selectedAgent.name} - {selectedAgent.description}
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
      
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".txt,.json,.yaml,.yml,.log"
        onChange={() => {/* Handle file upload */}}
      />
    </div>
  );
};

export default AIChatInterface;