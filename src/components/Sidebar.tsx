
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChatSession } from '@/hooks/useChat';
import { MessageSquare, User, Upload, Video, Settings, Search } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSessionSelect,
  onNewSession,
}) => {
  return (
    <div
      className={`fixed inset-y-0 left-0 w-72 bg-sidebar transition-transform transform z-20 
                 ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                 lg:translate-x-0 lg:relative`}
    >
      <div className="h-full flex flex-col text-sidebar-foreground">
        <div className="h-16 px-4 flex items-center justify-between border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-w3j-primary to-w3j-secondary p-1.5 rounded-md">
              <span className="text-white font-bold text-sm">W3J</span>
            </div>
            <h1 className="text-lg font-semibold">Assistant</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </Button>
        </div>
        
        <Button
          variant="outline"
          className="m-2 bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80"
          onClick={onNewSession}
        >
          <MessageSquare className="mr-2 h-4 w-4" /> New Chat
        </Button>
        
        <div className="px-2 py-4">
          <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-sidebar-foreground/70">
            FEATURES
          </h2>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent">
              <User className="mr-2 h-4 w-4" /> Chat
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent">
              <Upload className="mr-2 h-4 w-4" /> File Upload
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent">
              <Video className="mr-2 h-4 w-4" /> Video Chat
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent">
              <Search className="mr-2 h-4 w-4" /> Web Search
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent">
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Button>
          </div>
        </div>
        
        <Separator className="my-2 bg-sidebar-border" />
        
        <div className="flex-grow overflow-auto px-2 py-2">
          <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-sidebar-foreground/70">
            HISTORY
          </h2>
          {sessions.length > 0 ? (
            <div className="space-y-1">
              {sessions.map((session) => (
                <Button
                  key={session.id}
                  variant={currentSessionId === session.id ? "secondary" : "ghost"}
                  className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent truncate"
                  onClick={() => onSessionSelect(session.id)}
                >
                  <MessageSquare className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{session.title}</span>
                </Button>
              ))}
            </div>
          ) : (
            <p className="px-2 text-xs text-sidebar-foreground/70">No conversation history</p>
          )}
        </div>
        
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <span className="ml-2 text-sm">Guest User</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
