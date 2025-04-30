
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Settings, Brain } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="h-14 md:h-16 w-full flex items-center justify-between px-3 md:px-4 border-b neural-glass-strong backdrop-blur-md fixed top-0 z-10">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-9 w-9 lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2 ml-1 md:ml-2">
          <div className="bg-neural-gradient-purple p-1.5 rounded-md">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-base md:text-lg font-medium">Vocal Vision</h1>
        </div>
      </div>

      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
