import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Image } from 'lucide-react';

interface ImagePreviewProps {
  image: { file: File; url: string } | null;
  onRemove: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ image, onRemove }) => {
  if (!image) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="m-4 p-3 neural-glass rounded-lg shadow-neural"
      >
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Image className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Image attached</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRemove}
            className="h-6 w-6 p-0 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 rounded-full"
          >
            <span className="sr-only">Remove</span>
            &times;
          </Button>
        </div>
        <div className="rounded-md overflow-hidden border border-gray-200/50 dark:border-gray-700/30">
          <img 
            src={image.url} 
            alt="Upload preview" 
            className="h-24 object-contain w-full"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImagePreview;
