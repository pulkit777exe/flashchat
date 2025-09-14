import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { MessagesAtom, TypingUsersAtom, ConnectionStatusAtom } from "../store/atoms";
import { ChatMessage, isTextMessage, isFileMessage, validateFile } from "../types/chat";
import { useWebSocketManager } from "../hooks/useWebSocketManager";
import { useTypingIndicator } from "../hooks/useTypingIndicator";
import { TypingIndicatorComponent } from "../components/TypingIndicator";
import { MessageBubble } from "../components/MessageBubble";
import { ConnectionStatus } from "../components/ConnectionStatus";
import { Upload, X, Video, FileText } from 'lucide-react';

interface LocationState {
  roomCode?: string;
  userName?: string;
  userId?: string;
}

const FileUpload = ({ onFileSelect, disabled }: { onFileSelect: (file: File) => void; disabled?: boolean }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }
    onFileSelect(file);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
        disabled={disabled}
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-slate-600/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        title="Upload image or video"
      >
        <Upload size={20} />
      </button>
    </>
  );
};

const FilePreview = ({ 
  file, 
  onRemove, 
  uploadProgress 
}: { 
  file: File; 
  onRemove: () => void; 
  uploadProgress?: number; 
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const formatFileSize = (bytes: number) => (bytes / 1024 / 1024).toFixed(2) + ' MB';

  return (
    <div className="relative bg-slate-800 rounded-lg p-3 mb-3">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {isImage && (
            <div className="w-12 h-12 rounded overflow-hidden">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {isVideo && (
            <div className="w-12 h-12 rounded overflow-hidden bg-slate-700 flex items-center justify-center">
              <Video size={24} className="text-slate-400" />
            </div>
          )}
          {!isImage && !isVideo && (
            <div className="w-12 h-12 rounded bg-slate-700 flex items-center justify-center">
              <FileText size={24} className="text-slate-400" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{file.name}</p>
          <p className="text-slate-400 text-xs">{formatFileSize(file.size)}</p>
          
          {uploadProgress !== undefined && (
            <div className="mt-2">
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div 
                  className="bg-blue-400 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">{uploadProgress.toFixed(0)}%</p>
            </div>
          )}
        </div>
        
        <button
          onClick={onRemove}
          className="flex-shrink-0 text-slate-400 hover:text-white transition-colors p-1"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

const FileMessageBubble = ({ message, isCurrentUser }: { 
  message: ChatMessage; 
  isCurrentUser: boolean; 
}) => {
  const [showFullSize, setShowFullSize] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  if (!isFileMessage(message)) return null;
  
  const fileData = message.fileData;
  const isImage = fileData.type.startsWith('image/');
  const isVideo = fileData.type.startsWith('video/');
  
  const fileUrl = fileData.isBase64 
    ? `data:${fileData.type};base64,${fileData.data}`
    : fileData.url;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
          isCurrentUser 
            ? 'bg-white text-black' 
            : 'bg-slate-700 text-white'
        }`}>
          {!isCurrentUser && (
            <p className="text-xs text-slate-400 mb-2">{message.personName}</p>
          )}
          
          {isImage && fileUrl && (
            <div className="mb-2 relative group cursor-pointer" onClick={() => setShowFullSize(true)}>
              <img
                src={fileUrl}
                alt={fileData.name}
                className={`rounded max-w-full h-auto max-h-64 object-cover transition-all duration-300 ${
                  !imageLoaded ? 'opacity-0' : 'opacity-100'
                } group-hover:opacity-80`}
                onLoad={() => setImageLoaded(true)}
                loading="lazy"
              />
              
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-600 rounded">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>
          )}
          
          {isVideo && fileUrl && (
            <div className="mb-2">
              <video
                src={fileUrl}
                controls
                className="rounded max-w-full h-auto max-h-64"
                preload="metadata"
              >
                Your browser does not support video playback.
              </video>
            </div>
          )}
          
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="truncate font-medium">{fileData.name}</span>
              {(isImage || isVideo) && fileUrl && (
                <button
                  onClick={() => setShowFullSize(true)}
                  className="text-blue-500 hover:text-blue-400 ml-2 flex-shrink-0"
                >
                  View
                </button>
              )}
            </div>
            
            <div className="flex items-center justify-between text-xs opacity-75">
              <span>{formatFileSize(fileData.size)}</span>
              <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>

      {showFullSize && fileUrl && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullSize(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowFullSize(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X size={32} />
            </button>
            
            <div onClick={(e) => e.stopPropagation()}>
              {isImage && (
                <img
                  src={fileUrl}
                  alt={fileData.name}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg"
                />
              )}
              
              {isVideo && (
                <video
                  src={fileUrl}
                  controls
                  className="max-w-full max-h-[80vh] object-contain rounded-lg"
                  autoPlay
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default function ContainerSection() {
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef(0);
  const hasConnectedRef = useRef(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const locationState = location.state as LocationState;
  const { roomCode, userName, userId } = locationState || {};
  
  const isDataValid = useMemo(() => {
    return !!(roomCode && userName && userId);
  }, [roomCode, userName, userId]);

  const messages = useRecoilValue(MessagesAtom);
  const typingUsers = useRecoilValue(TypingUsersAtom);
  const connectionStatus = useRecoilValue(ConnectionStatusAtom);

  const websocketManager = useWebSocketManager();
  const { 
    connect, 
    disconnect, 
    sendMessage: wsSendMessage, 
    sendTypingIndicator: wsSendTypingIndicator,
    sendFile: wsSendFile 
  } = websocketManager;

  const sendMessage = useCallback((message: string): boolean => {
    if (!isDataValid) return false;
    return wsSendMessage(message, roomCode!, userName!, userId!);
  }, [wsSendMessage, isDataValid, roomCode, userName, userId]);

  const sendTypingIndicator = useCallback((isTyping: boolean): void => {
    if (!isDataValid) return;
    wsSendTypingIndicator(isTyping, roomCode!, userName!, userId!);
  }, [wsSendTypingIndicator, isDataValid, roomCode, userName, userId]);

  const sendFile = useCallback(async (file: File): Promise<boolean> => {
    if (!isDataValid || !wsSendFile) return false;
    
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const success = await wsSendFile(
        file, 
        roomCode!, 
        userName!, 
        userId!,
        (progress) => setUploadProgress(progress)
      );
      
      if (success) {
        setSelectedFile(null);
        setUploadProgress(0);
      }
      
      return success;
    } catch (error) {
      console.error('File upload failed:', error);
      alert('Failed to upload file: ' + (error as Error).message);
      return false;
    } finally {
      setIsUploading(false);
    }
  }, [wsSendFile, isDataValid, roomCode, userName, userId]);

  const { handleTyping, stopTyping } = useTypingIndicator(sendTypingIndicator);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!isDataValid) {
      console.log('Missing required data, redirecting to /join');
      navigate('/join', { replace: true });
      return;
    }

    if (!hasConnectedRef.current) {
      console.log('Connecting to WebSocket for the first time');
      hasConnectedRef.current = true;
      connect(roomCode!, userName!, userId!);
    }

    return () => {
      console.log('ContainerSection cleanup called');
    };
  }, [isDataValid, navigate, connect, roomCode, userName, userId]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      hasConnectedRef.current = false;
      disconnect();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (!window.location.pathname.includes('/chat')) {
        hasConnectedRef.current = false;
        disconnect();
      }
    };
  }, [disconnect]);

  useEffect(() => {
    if (messages.length !== lastMessageCountRef.current) {
      lastMessageCountRef.current = messages.length;
      setTimeout(scrollToBottom, 50);
    }
  }, [messages.length, scrollToBottom]);

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

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  const handleFileRemove = useCallback(() => {
    setSelectedFile(null);
    setUploadProgress(0);
  }, []);

  const handleFileSend = useCallback(async () => {
    if (!selectedFile) return;
    await sendFile(selectedFile);
  }, [selectedFile, sendFile]);

  const handleLeave = useCallback(() => {
    hasConnectedRef.current = false;
    disconnect();
    navigate('/join', { replace: true });
  }, [disconnect, navigate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleChatDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (connectionStatus !== 'connected') return;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [connectionStatus, handleFileSelect]);

  const handleChatDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

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

  const isInputDisabled = connectionStatus !== 'connected' || isUploading;
  const hasMessages = messages.length > 0;

  return (
    <div className="h-screen flex justify-center items-center bg-gradient-to-br from-black via-gray-900 to-slate-800 text-white font-inter p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-full h-full">
          <div className="absolute top-20 left-20 w-72 h-72 bg-slate-500/5 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-white/3 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse [animation-delay:2s]"></div>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <div 
        className="flex flex-col border border-slate-600/30 max-h-[800px] w-full max-w-2xl rounded-2xl bg-black/60 backdrop-blur-sm shadow-2xl overflow-hidden relative z-10"
        onDrop={handleChatDrop}
        onDragOver={handleChatDragOver}
      >
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

        <main className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {!hasMessages ? (
            <div className="text-center text-gray-400 mt-8">
              <div className="text-4xl mb-4">👋</div>
              <p className="text-lg font-medium">Welcome to the chat room!</p>
              <p className="text-sm mt-2 opacity-75">Start the conversation by sending a message or sharing a file.</p>
            </div>
          ) : (
            <>
              {messages.map((msg: ChatMessage, idx: number) => {
                if (isFileMessage(msg)) {
                  return (
                    <FileMessageBubble
                      key={msg.id || `${msg.personId}-${idx}`}
                      message={msg}
                      isCurrentUser={msg.personId === userId}
                    />
                  );
                }
                
                if (isTextMessage(msg)) {
                  return (
                    <MessageBubble
                      key={msg.id || `${msg.personId}-${idx}`}
                      message={msg}
                      isCurrentUser={msg.personId === userId}
                    />
                  );
                }
                
                return null;
              })}
              <TypingIndicatorComponent 
                typingUsers={typingUsers} 
                currentUserName={userName!} 
              />
            </>
          )}
          <div ref={messagesEndRef} aria-hidden="true" />
        </main>

        {selectedFile && (
          <div className="px-4 pb-2">
            <FilePreview
              file={selectedFile}
              onRemove={handleFileRemove}
              uploadProgress={isUploading ? uploadProgress : undefined}
            />
          </div>
        )}

        <footer className="p-4 border-t border-slate-600/30 bg-black/40">
          <div className="flex gap-3">
            <FileUpload 
              onFileSelect={handleFileSelect}
              disabled={isInputDisabled}
            />
            
            <input
              ref={inputRef}
              type="text"
              placeholder={
                isUploading ? "Uploading file..." : 
                isInputDisabled ? "Connecting..." : 
                "Type your message..."
              }
              onKeyDown={handleKeyDown}
              onChange={handleTyping}
              disabled={isInputDisabled}
              className="flex-1 p-3 rounded-lg bg-gray-800/60 text-white placeholder-gray-400 border border-slate-600/40 focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              maxLength={1000}
              autoComplete="off"
            />
            
            {selectedFile ? (
              <button
                onClick={handleFileSend}
                disabled={isInputDisabled}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:scale-[1.02] disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                aria-label="Send file"
              >
                {isUploading ? 'Uploading...' : 'Send File'}
              </button>
            ) : (
              <button
                onClick={handleSendMessage}
                disabled={isInputDisabled}
                className="bg-white hover:bg-slate-200 disabled:bg-gray-600 disabled:cursor-not-allowed text-black px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:scale-[1.02] disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-slate-400/50"
                aria-label="Send message"
              >
                Send
              </button>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send • Shift+Enter for new line • Drag & drop files to upload
            {connectionStatus === 'connecting' && (
              <span className="ml-2 text-yellow-400">• Connecting...</span>
            )}
            {isUploading && (
              <span className="ml-2 text-blue-400">• Uploading {uploadProgress.toFixed(0)}%</span>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}