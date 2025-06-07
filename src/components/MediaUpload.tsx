
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileIcon, ImageIcon, AudioLinesIcon, VideoIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MediaUploadProps {
  id: string;
  mediaType: 'image' | 'audio' | 'video' | 'any' | null;
  acceptedTypes: string;
  onFileChange: (file: File | null) => void;
  label?: string;
}

const MediaUpload = ({ 
  id, 
  mediaType, 
  acceptedTypes, 
  onFileChange,
  label = 'Drop file here or click to browse'
}: MediaUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleFiles = (file: File) => {
    setFile(file);
    onFileChange(file);
    
    // Create preview for images and video
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
      const videoPreview = URL.createObjectURL(file);
      setPreview(videoPreview);
    } else {
      setPreview(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    onFileChange(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getIconByMediaType = () => {
    switch(mediaType) {
      case 'image': return <ImageIcon size={24} />;
      case 'audio': return <AudioLinesIcon size={24} />;
      case 'video': return <VideoIcon size={24} />;
      default: return <FileIcon size={24} />;
    }
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 cursor-pointer flex flex-col items-center justify-center transition-colors ${
            isDragging 
              ? 'border-primary bg-primary bg-opacity-5' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            id={id}
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept={acceptedTypes}
            className="hidden"
          />
          
          <motion.div
            animate={{ y: isDragging ? -5 : 0 }}
            className={`w-12 h-12 mb-3 rounded-full flex items-center justify-center ${
              isDragging 
                ? 'bg-primary bg-opacity-10' 
                : 'bg-gray-100'
            }`}
          >
            <Upload
              size={20}
              className={isDragging ? 'text-primary' : 'text-gray-500'}
            />
          </motion.div>
          
          <p className="text-sm font-medium">
            {label}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {mediaType === 'any'
              ? 'Supports images, audio, and video files'
              : mediaType === 'audio'
                ? 'Supports WAV and MP3 audio files'
                : `Supports ${mediaType} files`
            }
          </p>
        </div>
      ) : (
        <div className="border rounded-lg p-4 relative">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={removeFile}
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
          >
            <XIcon size={14} />
          </Button>
          
          <div className="flex items-center">
            {preview && (file.type.startsWith('image/') || file.type.startsWith('video/')) ? (
              <div className="w-16 h-16 rounded mr-4 overflow-hidden flex-shrink-0">
                {file.type.startsWith('image/') ? (
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video 
                    src={preview}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ) : (
              <div className="w-12 h-12 rounded mr-4 bg-gray-100 flex items-center justify-center flex-shrink-0">
                {getIconByMediaType()}
              </div>
            )}
            
            <div className="overflow-hidden">
              <p className="font-medium text-sm truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || 'Unknown type'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUpload;
