
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LockIcon, UnlockIcon, GithubIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Index = () => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  return (
    <div className="min-h-screen steganography-container flex flex-col">
      <header className="w-full py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto flex justify-between items-center">
          <motion.h1 
            className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            HideInSight
          </motion.h1>
          <a 
            href="https://github.com/yourusername/your-repo" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <GithubIcon size={24} />
          </a>
        </div>
      </header>
      
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            Multimedia Steganography
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Hide secret messages in images, audio, and videos with advanced encryption techniques
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
          <Link to="/encrypt" className="w-full">
            <motion.div
              onMouseEnter={() => setHoveredButton('encrypt')}
              onMouseLeave={() => setHoveredButton(null)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="flex flex-col items-center justify-center p-8 h-52 cursor-pointer border-2 hover:border-primary transition-all">
                <div className="relative w-16 h-16 mb-4 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                  <LockIcon size={32} className="text-primary" />
                  {hoveredButton === 'encrypt' && (
                    <motion.div
                      className="absolute inset-0 bg-primary bg-opacity-20 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </div>
                <h2 className="text-2xl font-bold">Encrypt</h2>
                <p className="text-muted-foreground mt-2">Hide messages in media</p>
              </Card>
            </motion.div>
          </Link>
          
          <Link to="/decrypt" className="w-full">
            <motion.div
              onMouseEnter={() => setHoveredButton('decrypt')}
              onMouseLeave={() => setHoveredButton(null)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="flex flex-col items-center justify-center p-8 h-52 cursor-pointer border-2 hover:border-primary transition-all">
                <div className="relative w-16 h-16 mb-4 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                  <UnlockIcon size={32} className="text-primary" />
                  {hoveredButton === 'decrypt' && (
                    <motion.div
                      className="absolute inset-0 bg-primary bg-opacity-20 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </div>
                <h2 className="text-2xl font-bold">Decrypt</h2>
                <p className="text-muted-foreground mt-2">Extract hidden messages</p>
              </Card>
            </motion.div>
          </Link>
        </div>
      </main>
      
      <footer className="w-full py-6 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>Secure Multimedia Steganography</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

