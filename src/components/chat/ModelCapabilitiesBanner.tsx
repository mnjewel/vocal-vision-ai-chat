import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Code, Brain, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModelPersona } from '@/services/ModelManager';

interface ModelCapabilitiesBannerProps {
  isAgentic: boolean;
  hasApiKey: boolean;
  currentPersona: ModelPersona;
  onClearPersona: () => void;
}

const ModelCapabilitiesBanner: React.FC<ModelCapabilitiesBannerProps> = ({
  isAgentic,
  hasApiKey,
  currentPersona,
  onClearPersona
}) => {
  return (
    <>
      <AnimatePresence>
        {isAgentic && hasApiKey && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-4 mt-2 p-4 neural-glass rounded-lg border border-amber-200/50 dark:border-amber-700/30 shadow-neural"
          >
            <div className="flex items-center space-x-2 mb-2">
              <div className="p-1.5 bg-amber-100/80 dark:bg-amber-900/30 rounded-full">
                <Search className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="p-1.5 bg-amber-100/80 dark:bg-amber-900/30 rounded-full">
                <Code className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="font-medium text-amber-800 dark:text-amber-300">Agentic Assistant Enabled</span>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              This model can search the web and execute code to answer your questions.
              Try asking about current events, weather, calculations, or code examples.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {currentPersona.id !== 'default' && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-4 mt-2 p-3 neural-glass rounded-lg border border-blue-200/50 dark:border-blue-700/30 shadow-neural"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-blue-100/80 dark:bg-blue-900/30 rounded-full">
                  <Brain className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-medium text-blue-800 dark:text-blue-300">
                  {currentPersona.name} Active
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClearPersona}
                className="h-6 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100/50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30"
              >
                <X className="h-3.5 w-3.5 mr-1" /> Clear
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ModelCapabilitiesBanner;
