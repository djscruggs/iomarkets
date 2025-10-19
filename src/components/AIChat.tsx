import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  Download,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  autoFocus?: boolean;
  startExpanded?: boolean;
  investmentId?: string;
}

export function AIChat({ autoFocus = false, startExpanded = false, investmentId }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm here to help answer questions about this investment opportunity. Ask me anything about the deal structure, financials, risks, or due diligence materials.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(startExpanded);
  const [hasInteracted, setHasInteracted] = useState(startExpanded);
  const [hasUserMessages, setHasUserMessages] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Mark as interacted and expand to normal size on first message
    if (!hasInteracted) {
      setHasInteracted(true);
    }

    // Mark that user has sent at least one message
    if (!hasUserMessages) {
      setHasUserMessages(true);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Call the chat API with investment context
      if (!investmentId) {
        throw new Error('Investment ID is required for chat');
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          investmentId,
          message: input,
          history: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to get response');
      }

      // Format citations if present
      let content = data.response;
      if (data.citations && data.citations.length > 0) {
        const citationText = data.citations
          .map((c: any, i: number) => `[${i + 1}] ${c.source}`)
          .join('\n');
        content += `\n\nSources:\n${citationText}`;
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Sorry, I encountered an error: ${error.message}\n\nPlease make sure the documents have been indexed for this investment.`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadConversation = () => {
    const conversationText = messages
      .map((msg) => {
        const role = msg.role === "user" ? "You" : "AI Assistant";
        const time = msg.timestamp.toLocaleString();
        return `[${time}] ${role}:\n${msg.content}\n`;
      })
      .join("\n");

    const blob = new Blob([conversationText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deal-conversation-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Determine height based on state
  const getHeight = () => {
    if (isCollapsed) return "h-auto";
    if (isExpanded) return "h-[70vh]"; // 70% of screen height for expanded mode
    if (hasInteracted) return "h-[350px]"; // Normal height after interaction
    return "h-[200px]"; // Minimal height for initial message (20% taller than 140px)
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col transition-all duration-300 ${getHeight()}`}
    >
      {/* Header */}
      <div
        className="px-4 py-2 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-blue-600" />
          <h3 className="font-semibold text-gray-900 text-sm">
            AI Deal Assistant
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {hasUserMessages && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadConversation();
              }}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              title="Download Conversation"
            >
              <Download className="w-3 h-3" />
              <span>Download</span>
            </button>
          )}
          {hasInteracted && !isCollapsed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="text-gray-600 hover:text-gray-800 transition-colors cursor-pointer p-1"
              title={isExpanded ? "Normal Size" : "Expand to Half Screen"}
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          )}
          <div className="text-gray-600 p-1">
            {isCollapsed ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-xs">{message.content}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    message.role === "user" ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-3 py-2">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input */}
      {!isCollapsed && (
        <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about this deal..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
