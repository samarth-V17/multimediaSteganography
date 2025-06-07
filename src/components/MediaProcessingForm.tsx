
import { motion } from 'framer-motion';
import { ImageIcon, AudioLinesIcon, VideoIcon, ArrowLeftIcon, InfoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import MediaUpload from '@/components/MediaUpload';
import { createDownloadFileName } from '@/lib/fileUtils';
import type { MediaType } from './MediaTypeSelection';

interface MediaProcessingFormProps {
  mediaType: MediaType;
  onBack: () => void;
  onFileChange: (file: File | null) => void;
  onProcess: () => void;
  isProcessing: boolean;
  file: File | null;
  resultUrl: string | null;
  mode: 'encrypt' | 'decrypt';
  secretMessage?: string;
  onMessageChange?: (message: string) => void;
  decryptedMessage?: string | null;
}

export const acceptedFileTypes = {
  image: 'image/*',
  audio: 'audio/wav,audio/mp3,audio/mpeg',
  video: 'video/*',
};

export const MediaProcessingForm = ({
  mediaType,
  onBack,
  onFileChange,
  onProcess,
  isProcessing,
  file,
  resultUrl,
  mode,
  secretMessage,
  onMessageChange,
  decryptedMessage,
}: MediaProcessingFormProps) => {
  const IconComponent = {
    image: ImageIcon,
    audio: AudioLinesIcon,
    video: VideoIcon,
  }[mediaType || 'image'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-2xl"
    >
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to media selection
        </Button>

        <h2 className="text-2xl font-bold mb-2 flex items-center">
          <IconComponent className="mr-2" />
          {mediaType?.charAt(0).toUpperCase() + mediaType?.slice(1)} {mode === 'encrypt' ? 'Encryption' : 'Decryption'}
        </h2>

        <p className="text-muted-foreground">
          {mode === 'encrypt' ? (
            `Hide your message in ${mediaType} data`
          ) : (
            `Extract hidden messages from ${mediaType} data`
          )}
        </p>
      </div>

      <Card className="p-6 mb-6">
        <div className="space-y-6">
          <div>
            <Label htmlFor="file-upload">Upload {mediaType}</Label>
            <MediaUpload
              id="file-upload"
              mediaType={mediaType}
              acceptedTypes={acceptedFileTypes[mediaType!]}
              onFileChange={onFileChange}
            />
            {mediaType === 'audio' && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center">
                <InfoIcon className="h-3 w-3 mr-1" />
                WAV and MP3 files are supported for audio steganography
              </p>
            )}
          </div>

          {mode === 'encrypt' && onMessageChange && (
            <div>
              <Label htmlFor="secret-message">Secret message</Label>
              <Textarea
                id="secret-message"
                placeholder="Enter the message you want to hide..."
                className="min-h-32"
                value={secretMessage}
                onChange={(e) => onMessageChange(e.target.value)}
              />
              <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                <span>The message will be hidden using LSB steganography</span>
                <span>{secretMessage?.length || 0} characters</span>
              </div>
            </div>
          )}

          <Button
            onClick={onProcess}
            disabled={!file || (!decryptedMessage && mode === 'encrypt' && !secretMessage) || isProcessing}
            className="w-full"
          >
            {isProcessing ? "Processing..." : (mode === 'encrypt' ? "Encrypt & Download" : "Decrypt Message")}
          </Button>

          {mode === 'decrypt' && decryptedMessage && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Decrypted Message:</h3>
              <div className="p-4 rounded-md bg-gray-100 dark:bg-gray-800 whitespace-pre-line">
                {decryptedMessage}
              </div>
            </div>
          )}
        </div>
      </Card>

      {resultUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="mb-4 text-green-600 font-medium">
            {mode === 'encrypt' ? 'Your file has been processed successfully!' : 'Your message has been successfully extracted!'}
          </p>
          <Button asChild>
            <a
              href={resultUrl}
              download={file ? createDownloadFileName(file.name, mode === 'decrypt' ? 'decrypted-' : '') : `${mode}ed-file`}
            >
              Download {mode === 'encrypt' ? 'Encrypted File' : 'Decrypted Message'}
            </a>
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};
