
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChatSession } from '@/types/chat'; 
import { Separator } from '@/components/ui/separator';
import {
  MessageSquare,
  User,
  Upload,
  Video,
  Settings,
  Search,
  PlusCircle,
  Trash2
} from 'lucide-react';
import { useAuthContext } from './AuthProvider';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession?: (sessionId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSessionSelect,
  onNewSession,
  onDeleteSession
}) => {
  const { user, signOut } = useAuthContext();
  const navigate = useNavigate();

  const handleFeatureClick = (feature: string) => {
    toast.info(`${feature} feature is coming soon!`);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Filter out empty chat sessions and limit to 10 most recent for display
  const validSessions = sessions
    .filter(session => 
      session.title && session.title !== 'New Conversation' || session.id === currentSessionId
    )
    .sort((a, b) => {
      // Sort by last updated timestamp (most recent first)
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 10); // Limit to 10 most recent conversations

  return (
    <div
      className={`fixed inset-y-0 left-0 w-[280px] bg-background border-r border-border/50 transition-transform transform z-20
                 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                 lg:translate-x-0 lg:relative shadow-sm`}
    >
      <div className="h-full flex flex-col">
        <div className="h-14 md:h-16 px-4 flex items-center justify-between border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="bg-neural-gradient-purple p-1.5 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 2a8 8 0 0 0-8 8v12l6.5-6.5H12a8 8 0 0 0 0-16z"></path></svg>
            </div>
            <h1 className="text-base md:text-lg font-medium">W3J Assistant</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden h-8 w-8"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </Button>
        </div>

        <Button
          variant="default"
          className="m-3 bg-neural-gradient-purple hover:bg-purple-600 text-white"
          onClick={onNewSession}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> New Chat
        </Button>

        <div className="px-3 py-3">
          <h2 className="mb-2 px-1 text-xs font-medium text-muted-foreground">
            Features
          </h2>
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start text-sm h-9"
              onClick={() => navigate('/')}
            >
              <MessageSquare className="mr-2 h-4 w-4" /> Chat
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm h-9"
              onClick={() => handleFeatureClick('File Upload')}
            >
              <Upload className="mr-2 h-4 w-4" /> File Upload
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm h-9"
              onClick={() => handleFeatureClick('Video Chat')}
            >
              <Video className="mr-2 h-4 w-4" /> Video Chat
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm h-9"
              onClick={() => handleFeatureClick('Web Search')}
            >
              <Search className="mr-2 h-4 w-4" /> Web Search
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm h-9"
              onClick={() => handleFeatureClick('Settings')}
            >
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Button>
          </div>
        </div>

        <Separator className="my-2 bg-border/50" />

        <div className="flex-grow overflow-hidden">
          <h2 className="flex items-center justify-between mb-2 px-4 text-xs font-medium text-muted-foreground">
            <span>Recent Conversations</span>
            {validSessions.length > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted">{validSessions.length}</span>
            )}
          </h2>
          <ScrollArea className="h-[calc(100%-2rem)] px-3">
            {validSessions.length > 0 ? (
              <div className="space-y-1">
                {validSessions.map((session) => (
                  <div key={session.id} className="flex items-center group">
                    <Button
                      variant={currentSessionId === session.id ? "secondary" : "ghost"}
                      className="w-full justify-start h-9 text-sm truncate rounded-r-none"
                      onClick={() => onSessionSelect(session.id)}
                    >
                      <MessageSquare className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{session.title || "New Conversation"}</span>
                    </Button>
                    {onDeleteSession && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-2 rounded-l-none opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onDeleteSession(session.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-2 py-4 text-center">
                <p className="text-xs text-muted-foreground mb-2">No conversation history</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={onNewSession}
                >
                  Start a new chat
                </Button>
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="p-3 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <span className="ml-2 text-sm truncate max-w-[160px]">{user ? user.email : 'Guest User'}</span>
            </div>
            {user && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="h-8 w-8"
                title="Sign Out"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
