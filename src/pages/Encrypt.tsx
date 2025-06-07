
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import PageLayout from '@/components/PageLayout';
import { MediaTypeSelection, type MediaType } from '@/components/MediaTypeSelection';
import { MediaProcessingForm } from '@/components/MediaProcessingForm';
import { encryptMessageIntoFile } from '@/lib/steganography';

const Encrypt = () => {
  const [selectedMedia, setSelectedMedia] = useState<MediaType>(null);
  const [secretMessage, setSecretMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleMediaSelection = (type: MediaType) => {
    setSelectedMedia(type);
    setFile(null);
    setResultUrl(null);
  };

  const handleFileChange = (file: File | null) => {
    setFile(file);
    setResultUrl(null);
  };

  const handleEncrypt = async () => {
    if (!file) {
      toast({
        title: "Missing file",
        description: "Please upload a file to hide your message in.",
        variant: "destructive",
      });
      return;
    }

    if (!secretMessage.trim()) {
      toast({
        title: "Missing message",
        description: "Please enter a secret message to hide.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const encryptedBlob = await encryptMessageIntoFile(file, secretMessage);
      
      if (!encryptedBlob) {
        toast({
          title: "Encryption failed",
          description: "There was an error hiding your message in the file.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
      
      const downloadUrl = URL.createObjectURL(encryptedBlob);
      setResultUrl(downloadUrl);
      
      toast({
        title: "Encryption complete!",
        description: "Your message has been successfully hidden in the file.",
      });
    } catch (error: any) {
      console.error('Encryption error:', error);
      
      let errorMessage = "There was an error hiding your message in the file.";
      
      if (error?.message) {
        errorMessage = error.message;
        
        // Clean up any edge function or server-related errors to be more user-friendly
        if (errorMessage.includes('Edge Function')) {
          errorMessage = "Could not process this file. Please try a different file.";
        }
      }
      
      toast({
        title: "Encryption failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PageLayout
      title="Encrypt Media"
      description="Hide your secret message in images, audio, or videos"
    >
      {!selectedMedia ? (
        <MediaTypeSelection onSelect={handleMediaSelection} />
      ) : (
        <MediaProcessingForm
          mediaType={selectedMedia}
          onBack={() => setSelectedMedia(null)}
          onFileChange={handleFileChange}
          onProcess={handleEncrypt}
          isProcessing={isProcessing}
          file={file}
          resultUrl={resultUrl}
          mode="encrypt"
          secretMessage={secretMessage}
          onMessageChange={setSecretMessage}
        />
      )}
    </PageLayout>
  );
};

export default Encrypt;
