
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HomeIcon } from 'lucide-react';

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

const PageLayout = ({ children, title, description }: PageLayoutProps) => {
  return (
    <div className="min-h-screen steganography-container flex flex-col">
      <header className="w-full py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/">
            <motion.h1 
              className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              HideInSight
            </motion.h1>
          </Link>
          <Link 
            to="/"
            className="text-gray-500 hover:text-gray-700 transition-colors flex items-center"
          >
            <HomeIcon size={20} className="mr-1" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </div>
      </header>
      
      <main className="flex-grow flex flex-col items-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{title}</h1>
          {description && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </motion.div>
        
        {children}
      </main>
      
      <footer className="w-full py-6 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>Secure Multimedia Steganography</p>
        </div>
      </footer>
    </div>
  );
};

export default PageLayout;
