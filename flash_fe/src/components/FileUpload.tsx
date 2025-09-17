import React, { useRef, useState } from 'react';
import { Upload, File, Image, Video, Music, FileText, Archive, Code, FileSpreadsheet, FileType } from 'lucide-react';
import { validateFile, isImageFile, isVideoFile, isAudioFile, isDocumentFile, isArchiveFile, FileData } from './types';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  allowedTypes?: 'all' | 'images' | 'videos' | 'audio' | 'documents' | 'archives' | 'code';
  maxSize?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  disabled, 
  allowedTypes = 'all',
  maxSize 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  // const getFileIcon = (fileType: string) => {
  //   const mockFileData: FileData = { type: fileType, name: '', size: 0, data: '', isBase64: false };
    
  //   if (isImageFile(mockFileData)) return <Image size={20} />;
  //   if (isVideoFile(mockFileData)) return <Video size={20} />;
  //   if (isAudioFile(mockFileData)) return <Music size={20} />;
  //   if (isArchiveFile(mockFileData)) return <Archive size={20} />;
  //   if (isDocumentFile(mockFileData)) {
  //     if (fileType.includes('spreadsheet') || fileType.includes('excel')) return <FileSpreadsheet size={20} />;
  //     if (fileType.includes('text') || fileType.includes('plain')) return <FileText size={20} />;
  //     if (fileType.includes('javascript') || fileType.includes('html') || fileType.includes('css')) return <Code size={20} />;
  //     return <FileType size={20} />;
  //   }
  //   return <File size={20} />;
  // };

  // const getAcceptTypes = () => {
  //   switch (allowedTypes) {
  //     case 'images':
  //       return 'image/*';
  //     case 'videos':
  //       return 'video/*';
  //     case 'audio':
  //       return 'audio/*';
  //     case 'documents':
  //       return '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.rtf,.odt,.ods,.odp';
  //     case 'archives':
  //       return '.zip,.rar,.tar,.gz,.7z';
  //     case 'code':
  //       return '.html,.css,.js,.json,.xml,.md,.txt';
  //     default:
  //       return '*';
  //   }
  // };

  const getTypeDescription = () => {
    switch (allowedTypes) {
      case 'images':
        return 'Images (JPEG, PNG, GIF, WebP, SVG, etc.)';
      case 'videos':
        return 'Videos (MP4, WebM, AVI, MOV, etc.)';
      case 'audio':
        return 'Audio files (MP3, WAV, OGG, AAC, etc.)';
      case 'documents':
        return 'Documents (PDF, Word, Excel, PowerPoint, etc.)';
      case 'archives':
        return 'Archive files (ZIP, RAR, TAR, etc.)';
      case 'code':
        return 'Code files (HTML, CSS, JS, JSON, etc.)';
      default:
        return 'All supported file types';
    }
  };

  const isFileTypeAllowed = (file: File): boolean => {
    const mockFileData: FileData = { type: file.type, name: file.name, size: file.size, data: '', isBase64: false };
    
    switch (allowedTypes) {
      case 'images':
        return isImageFile(mockFileData);
      case 'videos':
        return isVideoFile(mockFileData);
      case 'audio':
        return isAudioFile(mockFileData);
      case 'documents':
        return isDocumentFile(mockFileData);
      case 'archives':
        return isArchiveFile(mockFileData);
      case 'code':
        return file.type.includes('javascript') || 
               file.type.includes('html') || 
               file.type.includes('css') ||
               file.type.includes('json') ||
               file.type.includes('xml') ||
               file.type.includes('markdown') ||
               file.type === 'text/plain';
      default:
        return true; // 'all' allows everything
    }
  };

  const handleFileSelect = (file: File) => {
    // Check if file type is allowed for this specific uploader
    if (!isFileTypeAllowed(file)) {
      alert(`This uploader only accepts ${getTypeDescription().toLowerCase()}.`);
      return;
    }

    const validation = validateFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    // Additional size check if custom maxSize is provided
    if (maxSize && file.size > maxSize) {
      const sizeMB = Math.round(maxSize / (1024 * 1024));
      alert(`File too large. Maximum size is ${sizeMB}MB.`);
      return;
    }

    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptTypes()}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileSelect(file);
          }
        }}
        className="hidden"
        disabled={disabled}
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-slate-600/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        title={`Upload ${getTypeDescription()}`}
      >
        <Upload size={20} />
      </button>

      {dragOver && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="bg-slate-800 rounded-xl p-8 border-2 border-dashed border-slate-400 max-w-md">
            <Upload size={48} className="mx-auto mb-4 text-slate-400" />
            <p className="text-white text-center text-xl font-semibold">Drop your file here</p>
            <p className="text-slate-400 text-center mt-2">{getTypeDescription()}</p>
          </div>
        </div>
      )}
    </>
  );
};

// Specialized file upload components for different file types

export const ImageUpload: React.FC<Omit<FileUploadProps, 'allowedTypes'>> = (props) => (
  <FileUpload {...props} allowedTypes="images" />
);

export const VideoUpload: React.FC<Omit<FileUploadProps, 'allowedTypes'>> = (props) => (
  <FileUpload {...props} allowedTypes="videos" />
);

export const AudioUpload: React.FC<Omit<FileUploadProps, 'allowedTypes'>> = (props) => (
  <FileUpload {...props} allowedTypes="audio" />
);

export const DocumentUpload: React.FC<Omit<FileUploadProps, 'allowedTypes'>> = (props) => (
  <FileUpload {...props} allowedTypes="documents" />
);

export const ArchiveUpload: React.FC<Omit<FileUploadProps, 'allowedTypes'>> = (props) => (
  <FileUpload {...props} allowedTypes="archives" />
);

export const CodeUpload: React.FC<Omit<FileUploadProps, 'allowedTypes'>> = (props) => (
  <FileUpload {...props} allowedTypes="code" />
);

// File preview component for displaying uploaded files
interface FilePreviewProps {
  file: File | FileData;
  onRemove?: () => void;
  onOpen?: () => void;
  className?: string;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove, onOpen, className = '' }) => {
  // Type-safe property access
  const fileType = file instanceof File ? file.type : file.type;
  const fileName = file instanceof File ? file.name : file.name;
  const fileSize = file instanceof File ? file.size : file.size;
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = () => {
    const mockFileData: FileData = { type: fileType, name: fileName, size: fileSize, data: '', isBase64: false };
    
    if (isImageFile(mockFileData)) return <Image size={24} className="text-blue-500" />;
    if (isVideoFile(mockFileData)) return <Video size={24} className="text-purple-500" />;
    if (isAudioFile(mockFileData)) return <Music size={24} className="text-green-500" />;
    if (isArchiveFile(mockFileData)) return <Archive size={24} className="text-yellow-500" />;
    if (isDocumentFile(mockFileData)) {
      if (fileType.includes('spreadsheet') || fileType.includes('excel')) 
        return <FileSpreadsheet size={24} className="text-emerald-500" />;
      if (fileType.includes('text') || fileType.includes('plain')) 
        return <FileText size={24} className="text-slate-500" />;
      if (fileType.includes('javascript') || fileType.includes('html') || fileType.includes('css')) 
        return <Code size={24} className="text-orange-500" />;
      return <FileType size={24} className="text-red-500" />;
    }
    return <File size={24} className="text-gray-500" />;
  };

  const handleOpen = () => {
    if (onOpen) {
      onOpen();
      return;
    }

    if (file instanceof File) {
      // Create object URL for File objects
      const url = URL.createObjectURL(file as Blob);
      window.open(url, '_blank');
      // Clean up the URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else {
      // Handle FileData objects
      const fileData = file as FileData;
      
      if (!fileData.data) {
        alert('No file data available');
        return;
      }

      if (fileData.isBase64) {
        // Create data URL from base64
        const dataUrl = `data:${fileData.type};base64,${fileData.data}`;
        window.open(dataUrl, '_blank');
      } else {
        // Handle URL or other data formats
        try {
          // Try to decode if it's a base64 string without the flag
          let binaryString = fileData.data;
          try {
            binaryString = atob(fileData.data);
          } catch {
            // If atob fails, use the data as-is
          }
          
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          const blob = new Blob([bytes], { type: fileData.type });
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank');
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (error) {
          console.error('Error opening file:', error);
          alert('Unable to open this file type');
        }
      }
    }
  };

  return (
    <div className={`flex items-center space-x-3 p-3 bg-slate-700 rounded-lg ${className}`}>
      {getFileIcon()}
      <div className="flex-1 min-w-0">
        <button
          onClick={handleOpen}
          className="text-sm font-medium text-white truncate hover:text-blue-400 transition-colors text-left block w-full"
          title="Click to open file"
        >
          {fileName}
        </button>
        <p className="text-xs text-slate-400">{formatFileSize(fileSize)}</p>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-slate-400 hover:text-red-400 transition-colors text-lg leading-none"
          title="Remove file"
        >
          ×
        </button>
      )}
    </div>
  );
};

// Multi-file upload component
interface MultiFileUploadProps {
  onFilesSelect: (files: File[]) => void;
  maxFiles?: number;
  disabled?: boolean;
  allowedTypes?: 'all' | 'images' | 'videos' | 'audio' | 'documents' | 'archives' | 'code';
}

export const MultiFileUpload: React.FC<MultiFileUploadProps> = ({
  onFilesSelect,
  maxFiles = 10,
  disabled,
  allowedTypes = 'all'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const handleFilesSelect = (newFiles: File[]) => {
    const validFiles: File[] = [];
    
    for (const file of newFiles) {
      // Check if file type is allowed for this specific uploader
      const mockFileData: FileData = { type: file.type, name: file.name, size: file.size, data: '', isBase64: false };
      let isTypeAllowed = true;
      
      switch (allowedTypes) {
        case 'images':
          isTypeAllowed = isImageFile(mockFileData);
          break;
        case 'videos':
          isTypeAllowed = isVideoFile(mockFileData);
          break;
        case 'audio':
          isTypeAllowed = isAudioFile(mockFileData);
          break;
        case 'documents':
          isTypeAllowed = isDocumentFile(mockFileData);
          break;
        case 'archives':
          isTypeAllowed = isArchiveFile(mockFileData);
          break;
        case 'code':
          isTypeAllowed = file.type.includes('javascript') || 
                         file.type.includes('html') || 
                         file.type.includes('css') ||
                         file.type.includes('json') ||
                         file.type.includes('xml') ||
                         file.type.includes('markdown') ||
                         file.type === 'text/plain';
          break;
        default:
          isTypeAllowed = true; // 'all' allows everything
      }
      
      if (!isTypeAllowed) {
        alert(`${file.name}: This uploader only accepts ${allowedTypes} files.`);
        continue;
      }
      
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        alert(`${file.name}: ${validation.error}`);
      }
    }

    const totalFiles = selectedFiles.length + validFiles.length;
    if (totalFiles > maxFiles) {
      alert(`Cannot upload more than ${maxFiles} files.`);
      return;
    }

    const updatedFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(updatedFiles);
    onFilesSelect(updatedFiles);
  };

  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    onFilesSelect(updatedFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFilesSelect(files);
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) {
            handleFilesSelect(files);
          }
        }}
        className="hidden"
        disabled={disabled}
      />
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver 
            ? 'border-blue-400 bg-blue-50/5' 
            : 'border-slate-600 hover:border-slate-500'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
      >
        <Upload size={48} className="mx-auto mb-4 text-slate-400" />
        <h3 className="text-lg font-semibold text-white mb-2">Upload Multiple Files</h3>
        <p className="text-slate-400 mb-4">
          Drop files here or click to browse ({selectedFiles.length}/{maxFiles} files)
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || selectedFiles.length >= maxFiles}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          Select Files
        </button>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300">Selected Files:</h4>
          {selectedFiles.map((file, index) => (
            <FilePreview
              key={index}
              file={file}
              onRemove={() => removeFile(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};