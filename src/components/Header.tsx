
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Settings, Brain } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const isMobile = useIsMobile();

  return (
    <header className="h-14 md:h-16 w-full flex items-center justify-between px-3 md:px-4 border-b neural-glass-strong backdrop-blur-md fixed top-0 left-0 right-0 z-20">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar} 
          className="h-9 w-9 mr-1 text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2 ml-1 md:ml-2">
          <div className="bg-neural-gradient-purple p-1.5 rounded-md shadow-sm">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-base md:text-lg font-medium bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            Vocal Vision
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!isMobile && (
          <span className="text-sm text-muted-foreground mr-2">
            AI-powered conversation assistant
          </span>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
