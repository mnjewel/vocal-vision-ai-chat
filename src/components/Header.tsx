
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
          <div className="font-semibold text-lg neural-gradient-text">Neural Chat</div>
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
