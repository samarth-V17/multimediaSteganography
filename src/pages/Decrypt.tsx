
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import PageLayout from '@/components/PageLayout';
import { MediaTypeSelection, type MediaType } from '@/components/MediaTypeSelection';
import { MediaProcessingForm } from '@/components/MediaProcessingForm';
import { decryptMessageFromFile } from '@/lib/steganography';

const Decrypt = () => {
  const [selectedMedia, setSelectedMedia] = useState<MediaType>(null);
  const [file, setFile] = useState<File | null>(null);
  const [decryptedMessage, setDecryptedMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleMediaSelection = (type: MediaType) => {
    setSelectedMedia(type);
    setFile(null);
    setDecryptedMessage(null);
    setResultUrl(null);
  };

  const handleFileChange = (file: File | null) => {
    setFile(file);
    setDecryptedMessage(null);
    setResultUrl(null);
  };

  const handleDecrypt = async () => {
    if (!file) {
      toast({
        title: "Missing file",
        description: "Please upload a file to decrypt.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setDecryptedMessage(null);
    setResultUrl(null);

    try {
      const message = await decryptMessageFromFile(file);

      if (message && message.trim() !== '') {
        setDecryptedMessage(message);
        const decryptedBlob = new Blob([message], { type: 'text/plain' });
        const downloadUrl = URL.createObjectURL(decryptedBlob);
        setResultUrl(downloadUrl);

        toast({
          title: "Decryption complete!",
          description: "The message has been successfully extracted from the file.",
        });
      } else {
        toast({
          title: "Decryption failed",
          description: "No hidden message was found in the file. Make sure this file contains steganographic data.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Decryption error:', error);
      
      // Extract specific error message
      let errorMessage = "There was an error decrypting the file.";
      
      if (error?.message) {
        errorMessage = error.message;
        
        // Clean up any edge function or server-related errors to be more user-friendly
        if (errorMessage.includes('Edge Function')) {
          errorMessage = "Could not process this file. The file might not contain a hidden message or may be corrupted.";
        } else if (errorMessage.includes('Invalid message length')) {
          errorMessage = "This file doesn't appear to contain a valid hidden message.";
        } else if (errorMessage.includes('Message length exceeds')) {
          errorMessage = "The file format is not compatible with our steganography method.";
        }
      }
      
      toast({
        title: "Decryption failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PageLayout
      title="Decrypt Media"
      description="Reveal secret messages hidden in images, audio, or videos"
    >
      {!selectedMedia ? (
        <MediaTypeSelection onSelect={handleMediaSelection} />
      ) : (
        <MediaProcessingForm
          mediaType={selectedMedia}
          onBack={() => setSelectedMedia(null)}
          onFileChange={handleFileChange}
          onProcess={handleDecrypt}
          isProcessing={isProcessing}
          file={file}
          resultUrl={resultUrl}
          mode="decrypt"
          decryptedMessage={decryptedMessage}
        />
      )}
    </PageLayout>
  );
};

export default Decrypt;
