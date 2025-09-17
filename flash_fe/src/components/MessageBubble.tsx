import { memo } from 'react';
import { ChatMessage, FileData, isImageFile, isVideoFile } from '../types/chat';
interface MessageBubbleProps {
  message: ChatMessage;
  isCurrentUser: boolean;
}

const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileMessage = memo<{ fileData: FileData; isCurrentUser: boolean }>(({ fileData, isCurrentUser }) => {
  const { name, type, size, data, isBase64 } = fileData;
  
  const dataUrl = isBase64 ? `data:${type};base64,${data}` : data;
  
  const downloadFile = () => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isImageFile(fileData)) {
    return (
      <div className="space-y-2">
        <div className="relative group">
          <img
            src={dataUrl}
            alt={name}
            className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={downloadFile}
            onError={(e) => {
              console.error('Error loading image:', e);
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="bg-black/70 text-white px-2 py-1 rounded text-sm">
              Click to download
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className={isCurrentUser ? 'text-gray-600' : 'text-gray-400'}>
            📷 {name}
          </span>
          <span className={isCurrentUser ? 'text-gray-600' : 'text-gray-400'}>
            {formatFileSize(size)}
          </span>
        </div>
      </div>
    );
  }

  if (isVideoFile(fileData)) {
    return (
      <div className="space-y-2">
        <video
          src={dataUrl}
          controls
          className="max-w-full max-h-64 rounded-lg"
          onError={(e) => {
            console.error('Error loading video:', e);
            (e.target as HTMLVideoElement).style.display = 'none';
          }}
        >
          Your browser does not support the video tag.
        </video>
        <div className="flex items-center justify-between text-xs">
          <span className={isCurrentUser ? 'text-gray-600' : 'text-gray-400'}>
            🎥 {name}
          </span>
          <span className={isCurrentUser ? 'text-gray-600' : 'text-gray-400'}>
            {formatFileSize(size)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`flex items-center space-x-3 p-3 rounded-lg border-2 border-dashed cursor-pointer hover:bg-opacity-80 transition-all ${
        isCurrentUser 
          ? 'border-gray-300 bg-gray-50 hover:bg-gray-100' 
          : 'border-gray-600 bg-gray-800/50 hover:bg-gray-800/70'
      }`}
      onClick={downloadFile}
    >
      <div className="flex-shrink-0">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          isCurrentUser ? 'bg-blue-100 text-blue-600' : 'bg-blue-900/50 text-blue-400'
        }`}>
          📄
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium truncate ${
          isCurrentUser ? 'text-gray-900' : 'text-white'
        }`}>
          {name}
        </div>
        <div className={`text-xs ${
          isCurrentUser ? 'text-gray-600' : 'text-gray-400'
        }`}>
          {formatFileSize(size)} • Click to download
        </div>
      </div>
      <div className="flex-shrink-0">
        <div className={`text-sm ${
          isCurrentUser ? 'text-gray-500' : 'text-gray-400'
        }`}>
          ⬇️
        </div>
      </div>
    </div>
  );
});

export const MessageBubble = memo<MessageBubbleProps>(({ message, isCurrentUser }) => {
  const isSystemMessage = message.type === 'info' || message.type === 'system';
  const isErrorMessage = message.type === 'error';
  const isFileMessage = message.type === 'file';
  
  if (isSystemMessage) {
    return (
      <div className="text-center py-2">
        <span className="text-sm text-gray-400 bg-gray-800/30 px-3 py-1 rounded-full">
          {escapeHtml(message.message)}
        </span>
        <div className="text-xs text-gray-500 mt-1">
          {formatTime(message.timestamp)}
        </div>
      </div>
    );
  }

  if (isErrorMessage) {
    return (
      <div className="text-center py-2">
        <span className="text-sm text-red-400 bg-red-900/20 px-3 py-1 rounded-full border border-red-800/30">
          ⚠️ {escapeHtml(message.message)}
        </span>
        <div className="text-xs text-gray-500 mt-1">
          {formatTime(message.timestamp)}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
        <div className={`rounded-2xl px-4 py-2 ${
          isCurrentUser
            ? 'bg-white text-black rounded-br-md'
            : 'bg-gray-700/80 text-white rounded-bl-md'
        }`}>
          {!isCurrentUser && (
            <div className="text-xs font-medium text-gray-300 mb-1">
              {escapeHtml(message.personName)}
            </div>
          )}
          
          {isFileMessage && message.fileData ? (
            <FileMessage 
              fileData={message.fileData} 
              isCurrentUser={isCurrentUser}
            />
          ) : (
            <div className="break-words whitespace-pre-wrap">
              {escapeHtml(message.message)}
            </div>
          )}
          
          <div className={`text-xs mt-1 ${
            isCurrentUser ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
});

FileMessage.displayName = 'FileMessage';
MessageBubble.displayName = 'MessageBubble';
