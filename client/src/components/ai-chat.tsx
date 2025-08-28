import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, User, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  hasInvestmentIntent?: boolean;
}

interface AIChatProps {
  userId: string;
  onPurchaseRequest: () => void;
}

export default function AIChat({ userId, onPurchaseRequest }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "ai",
      content: "Welcome to GoldAI! I'm here to help you make informed decisions about digital gold investments. Ask me anything about gold prices, market trends, or investment strategies."
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: chatHistory } = useQuery({
    queryKey: ["/api/chat-history", userId],
    enabled: !!userId,
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/chat", { message, userId });
      return response.json();
    },
    onSuccess: (data) => {
      const aiMessage: Message = {
        id: Date.now().toString() + "-ai",
        type: "ai",
        content: data.response,
        hasInvestmentIntent: data.hasInvestmentIntent
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);

      if (data.hasInvestmentIntent) {
        // Add a slight delay before showing purchase option
        setTimeout(() => {
          onPurchaseRequest();
        }, 1000);
      }
    },
    onError: (error) => {
      console.error("Chat error:", error);
      setIsTyping(false);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (!currentMessage.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: currentMessage
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    chatMutation.mutate(currentMessage);
    setCurrentMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border h-[700px] flex flex-col" data-testid="ai-chat-container">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 gradient-gold rounded-full flex items-center justify-center">
            <Bot className="text-primary-foreground" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground" data-testid="chat-header-title">GoldAI Assistant</h3>
            <p className="text-sm text-muted-foreground" data-testid="chat-header-subtitle">Your intelligent gold investment advisor</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" data-testid="status-indicator"></div>
          <span className="text-sm text-muted-foreground" data-testid="status-text">Online</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" data-testid="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`flex items-start space-x-3 ${message.type === "user" ? "justify-end" : ""}`}>
            {message.type === "ai" && (
              <div className="w-8 h-8 gradient-gold rounded-full flex items-center justify-center flex-shrink-0">
                <Bot size={14} className="text-primary-foreground" />
              </div>
            )}
            <div className={`rounded-lg p-4 max-w-md ${
              message.type === "ai" 
                ? "chat-bubble-ai" 
                : "chat-bubble-user"
            }`} data-testid={`message-${message.type}-${message.id}`}>
              <p className={message.type === "ai" ? "text-foreground" : "text-primary-foreground"}>
                {message.content}
              </p>
              {message.hasInvestmentIntent && (
                <Button 
                  onClick={onPurchaseRequest}
                  className="mt-3 bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
                  size="sm"
                  data-testid="start-investment-button"
                >
                  Start Investment
                </Button>
              )}
            </div>
            {message.type === "user" && (
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                <User size={14} className="text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start space-x-3" data-testid="typing-indicator">
            <div className="w-8 h-8 gradient-gold rounded-full flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-primary-foreground" />
            </div>
            <div className="chat-bubble-ai rounded-lg p-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full typing-indicator"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full typing-indicator" style={{animationDelay: "0.2s"}}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full typing-indicator" style={{animationDelay: "0.4s"}}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="border-t border-border p-4">
        <div className="flex space-x-3">
          <Input
            type="text"
            placeholder="Ask about gold investments, market trends, or say 'I want to buy gold'..."
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-input border border-border text-foreground placeholder-muted-foreground"
            disabled={chatMutation.isPending}
            data-testid="chat-input"
          />
          <Button
            onClick={handleSendMessage}
            disabled={chatMutation.isPending || !currentMessage.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-testid="send-button"
          >
            <Send size={16} className="mr-2" />
            Send
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span data-testid="powered-by">Powered by Langchain + Ollama</span>
          <span data-testid="security-indicator">🔒 Secure & Private</span>
        </div>
      </div>
    </div>
  );
}
