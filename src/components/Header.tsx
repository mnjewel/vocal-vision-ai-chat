
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Settings } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="h-16 w-full flex items-center justify-between px-4 border-b glass-effect fixed top-0 z-10">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2 ml-2">
          <div className="bg-gradient-to-r from-w3j-primary to-w3j-secondary p-1.5 rounded-md">
            <span className="text-white font-bold text-sm">W3J</span>
          </div>
          <h1 className="text-lg font-semibold">Assistant</h1>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
