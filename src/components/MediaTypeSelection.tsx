
import { motion } from 'framer-motion';
import { ImageIcon, AudioLinesIcon, VideoIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

export type MediaType = 'image' | 'audio' | 'video' | null;

interface MediaTypeSelectionProps {
  onSelect: (type: MediaType) => void;
}

export const mediaCards = [
  { type: 'image', icon: ImageIcon, title: 'Image', description: 'Process PNG, JPG, GIF files' },
  { type: 'audio', icon: AudioLinesIcon, title: 'Audio', description: 'Process WAV, MP3 files' },
  { type: 'video', icon: VideoIcon, title: 'Video', description: 'Process MP4, AVI, MOV files' },
];

export const MediaTypeSelection = ({ onSelect }: MediaTypeSelectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-4xl"
    >
      <h2 className="text-xl font-medium mb-6">Select media type:</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mediaCards.map((media) => (
          <motion.div
            key={media.type}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(media.type as MediaType)}
          >
            <Card className="media-card flex flex-col items-center p-6 cursor-pointer border-2 h-full">
              <div className="w-16 h-16 mb-4 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                <media.icon size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold">{media.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 text-center">{media.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
