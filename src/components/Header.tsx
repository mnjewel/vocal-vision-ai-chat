
import { ThemeToggle } from "@/components/ThemeToggle";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-20 h-16 shadow-sm backdrop-blur-md neural-glass-strong">
      <div className="container h-full px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden mr-2">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <div className="flex items-center gap-2">
            <div className="bg-neural-gradient-purple p-1.5 rounded-md hidden sm:flex">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 2a8 8 0 0 0-8 8v12l6.5-6.5H12a8 8 0 0 0 0-16z"></path></svg>
            </div>
            <div className="font-semibold text-lg neural-gradient-text">W3J Assistant</div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <PWAInstallPrompt />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
