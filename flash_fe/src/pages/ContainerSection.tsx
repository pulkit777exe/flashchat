import { useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { MessagesAtom, TypingUsersAtom, ConnectionStatusAtom } from "../store/atoms";
import { ChatMessage } from "../types/chat";
import { useWebSocketManager } from "../hooks/useWebSocketManager";
import { useTypingIndicator } from "../hooks/useTypingIndicator";
import { TypingIndicatorComponent } from "../components/TypingIndicator";
import { MessageBubble } from "../components/MessageBubble";
import { ConnectionStatus } from "../components/ConnectionStatus";

interface LocationState {
  roomCode?: string;
  userName?: string;
  userId?: string;
}

export default function ContainerSection() {
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef(0);
  const hasConnectedRef = useRef(false); // Track if we've already connected
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract and validate location state
  const locationState = location.state as LocationState;
  const { roomCode, userName, userId } = locationState || {};
  
  // Memoize validation result to prevent unnecessary re-renders
  const isDataValid = useMemo(() => {
    return !!(roomCode && userName && userId);
  }, [roomCode, userName, userId]);

  // Get state from Recoil atoms
  const messages = useRecoilValue(MessagesAtom);
  const typingUsers = useRecoilValue(TypingUsersAtom);
  const connectionStatus = useRecoilValue(ConnectionStatusAtom);

  // WebSocket management - memoized to prevent recreating
  const websocketManager = useWebSocketManager();
  const { connect, disconnect, sendMessage: wsSendMessage, sendTypingIndicator: wsSendTypingIndicator } = websocketManager;

  // Memoized message and typing handlers - only recreate if data changes
  const sendMessage = useCallback((message: string): boolean => {
    if (!isDataValid) return false;
    return wsSendMessage(message, roomCode!, userName!, userId!);
  }, [wsSendMessage, isDataValid, roomCode, userName, userId]);

  const sendTypingIndicator = useCallback((isTyping: boolean): void => {
    if (!isDataValid) return;
    wsSendTypingIndicator(isTyping, roomCode!, userName!, userId!);
  }, [wsSendTypingIndicator, isDataValid, roomCode, userName, userId]);

  // Typing indicator management
  const { handleTyping, stopTyping } = useTypingIndicator(sendTypingIndicator);

  // Auto-scroll functionality
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Handle connection - only connect once
  useEffect(() => {
    if (!isDataValid) {
      console.log('Missing required data, redirecting to /join');
      navigate('/join', { replace: true });
      return;
    }

    // Only connect once per session
    if (!hasConnectedRef.current) {
      console.log('Connecting to WebSocket for the first time');
      hasConnectedRef.current = true;
      connect(roomCode!, userName!, userId!);
    }

    // Cleanup function - but don't disconnect on every re-render
    return () => {
      // Only cleanup on actual unmount, not on re-renders
      console.log('ContainerSection cleanup called');
    };
  }, [isDataValid, navigate]); // Removed connect, roomCode, userName, userId from deps

  // Separate effect for handling page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      hasConnectedRef.current = false;
      disconnect();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Only disconnect when component actually unmounts for good
      if (!window.location.pathname.includes('/chat')) {
        hasConnectedRef.current = false;
        disconnect();
      }
    };
  }, [disconnect]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messages.length !== lastMessageCountRef.current) {
      lastMessageCountRef.current = messages.length;
      // Small delay to ensure message is rendered
      setTimeout(scrollToBottom, 50);
    }
  }, [messages.length, scrollToBottom]);

  // Message send handler
  const handleSendMessage = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;

    const value = input.value.trim();
    if (!value) return;

    const sent = sendMessage(value);
    if (sent) {
      input.value = "";
      input.focus();
    }
    stopTyping();
  }, [sendMessage, stopTyping]);

  // Leave room handler
  const handleLeave = useCallback(() => {
    hasConnectedRef.current = false;
    disconnect();
    navigate('/join', { replace: true });
  }, [disconnect, navigate]);

  // Keyboard event handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Loading state
  if (!isDataValid) {
    return (
      <div className="h-screen flex justify-center items-center bg-gradient-to-br from-black via-gray-900 to-slate-800 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
          <p className="text-gray-300">Redirecting to join page...</p>
        </div>
      </div>
    );
  }

  const isInputDisabled = connectionStatus !== 'connected';
  const hasMessages = messages.length > 0;

  return (
    <div className="h-screen flex justify-center items-center bg-gradient-to-br from-black via-gray-900 to-slate-800 text-white font-inter p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-full h-full">
          <div className="absolute top-20 left-20 w-72 h-72 bg-slate-500/5 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-white/3 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse [animation-delay:2s]"></div>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <div className="flex flex-col border border-slate-600/30 max-h-[800px] w-full max-w-2xl rounded-2xl bg-black/60 backdrop-blur-sm shadow-2xl overflow-hidden relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-slate-600/30 bg-black/40">
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-lg text-white truncate">
              Room: <span className="font-mono text-slate-300">{roomCode}</span>
            </h2>
            <p className="text-sm text-gray-300 truncate">Logged in as {userName}</p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <ConnectionStatus />
            <button
              onClick={handleLeave}
              className="text-gray-400 hover:text-white transition-colors text-sm px-3 py-1.5 rounded-md hover:bg-slate-600/20 focus:outline-none focus:ring-2 focus:ring-slate-400/50"
              aria-label="Leave room"
            >
              Leave
            </button>
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {!hasMessages ? (
            <div className="text-center text-gray-400 mt-8">
              <div className="text-4xl mb-4">👋</div>
              <p className="text-lg font-medium">Welcome to the chat room!</p>
              <p className="text-sm mt-2 opacity-75">Start the conversation by sending a message.</p>
            </div>
          ) : (
            <>
              {messages.map((msg: ChatMessage, idx: number) => (
                <MessageBubble
                  key={msg.id || `${msg.personId}-${idx}`}
                  message={msg}
                  isCurrentUser={msg.personId === userId}
                />
              ))}
              <TypingIndicatorComponent 
                typingUsers={typingUsers} 
                currentUserName={userName!} 
              />
            </>
          )}
          <div ref={messagesEndRef} aria-hidden="true" />
        </main>

        {/* Input */}
        <footer className="p-4 border-t border-slate-600/30 bg-black/40">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              placeholder={isInputDisabled ? "Connecting..." : "Type your message..."}
              onKeyDown={handleKeyDown}
              onChange={handleTyping}
              disabled={isInputDisabled}
              className="flex-1 p-3 rounded-lg bg-gray-800/60 text-white placeholder-gray-400 border border-slate-600/40 focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              maxLength={1000}
              autoComplete="off"
            />
            <button
              onClick={handleSendMessage}
              disabled={isInputDisabled}
              className="bg-white hover:bg-slate-200 disabled:bg-gray-600 disabled:cursor-not-allowed text-black px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:scale-[1.02] disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-slate-400/50"
              aria-label="Send message"
            >
              Send
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send • Shift+Enter for new line
            {connectionStatus === 'connecting' && (
              <span className="ml-2 text-yellow-400">• Connecting...</span>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}