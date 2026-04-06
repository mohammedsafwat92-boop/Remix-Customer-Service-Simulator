import React, { useState, useRef, useEffect } from 'react';
import { Message, SimulationConfig } from '../types';
import { Send, SquareSquare, User, Bot, Loader2, Clock } from 'lucide-react';

interface ChatProps {
  config: SimulationConfig;
  history: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onEndSimulation: () => void;
}

const MAX_TIME_MS = 15 * 60 * 1000; // 15 minutes

export function Chat({ config, history, isLoading, onSendMessage, onEndSimulation }: ChatProps) {
  const [input, setInput] = useState('');
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [timeLeft, setTimeLeft] = useState(MAX_TIME_MS);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          clearInterval(timerRef.current!);
          onEndSimulation();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [onEndSimulation]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filter out the initial system prompt from the UI
  const displayHistory = history.slice(1);

  useEffect(() => {
    const processNewMessages = async () => {
      if (processingRef.current) return;
      
      const currentVisibleCount = visibleMessages.length;
      const totalMessages = displayHistory.length;

      if (totalMessages > currentVisibleCount) {
        processingRef.current = true;
        
        // Find the new messages
        const newMessages = displayHistory.slice(currentVisibleCount);
        
        for (const msg of newMessages) {
          if (msg.role === 'model') {
            setIsTyping(true);
            // Simulate typing delay based on message length
            const delay = Math.min(Math.max(msg.text.length * 20, 1000), 3000);
            await new Promise(resolve => setTimeout(resolve, delay));
            setIsTyping(false);
          }
          setVisibleMessages(prev => [...prev, msg]);
          // Small pause between messages
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        processingRef.current = false;
      }
    };

    processNewMessages();
  }, [displayHistory, visibleMessages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [visibleMessages, isTyping, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isTyping) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Active Simulation</h2>
          <p className="text-sm text-slate-500 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            Customer is connected ({config.difficulty} Mode)
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
            timeLeft < 60000 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600'
          }`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={() => onEndSimulation()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <SquareSquare className="w-4 h-4" />
            End & Evaluate
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
        {visibleMessages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-4 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300 ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'
            }`}>
              {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <span className="text-xs text-slate-500 mb-1 px-1">
                {msg.role === 'user' ? 'You (Agent)' : 'Customer'}
              </span>
              <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-sm' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        
        {(isLoading || isTyping) && (
          <div className="flex gap-4 max-w-[85%] animate-in fade-in duration-200">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs text-slate-500 mb-1 px-1">Customer</span>
              <div className="px-5 py-4 rounded-2xl bg-white border border-slate-200 rounded-tl-sm shadow-sm flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                </div>
                <span className="text-sm text-slate-400 font-medium">Customer is typing...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={isTyping ? "Wait for customer to finish..." : "Type your response to the customer..."}
            className="w-full max-h-32 min-h-[56px] px-4 py-3 pr-14 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-none bg-slate-50/50"
            rows={1}
            disabled={isLoading || isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || isTyping}
            className="absolute right-2 bottom-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-xs text-slate-400 mt-2 text-center">
          Press Enter to send, Shift + Enter for new line.
        </p>
      </div>
    </div>
  );
}
