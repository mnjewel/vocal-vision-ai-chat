import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Search, 
  GitBranch, 
  History,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Message } from '@/types/chat';
import { format } from 'date-fns';

interface ChatTimelineProps {
  messages: Message[];
  memorySnapshots: any[];
  branches: any[];
  onSearchMessages: (query: string) => Message[];
  onJumpToMessage: (id: string) => void;
  onCreateBranch: () => Promise<string | null>;
}

const ChatTimeline: React.FC<ChatTimelineProps> = ({
  messages,
  memorySnapshots,
  branches,
  onSearchMessages,
  onJumpToMessage,
  onCreateBranch
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<'timeline' | 'search' | 'branches'>('timeline');

  // Group messages by date
  const messagesByDate = React.useMemo(() => {
    const grouped: Record<string, Message[]> = {};
    
    messages.forEach(message => {
      const dateKey = formatDateKey(message.timestamp);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(message);
    });
    
    return grouped;
  }, [messages]);

  // Handle search
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results = onSearchMessages(searchQuery);
    setSearchResults(results);
  };

  // Handle search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (!e.target.value.trim()) {
      setSearchResults([]);
    }
  };

  // Handle search input keydown
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle create branch
  const handleCreateBranch = async () => {
    await onCreateBranch();
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-4 top-2 z-10"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-background/80 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4 mb-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-2">
                <Button
                  variant={activeTab === 'timeline' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('timeline')}
                  className="gap-1.5"
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Timeline</span>
                </Button>
                <Button
                  variant={activeTab === 'search' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('search')}
                  className="gap-1.5"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Search</span>
                </Button>
                <Button
                  variant={activeTab === 'branches' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('branches')}
                  className="gap-1.5"
                >
                  <GitBranch className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Branches</span>
                </Button>
              </div>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCreateBranch}
                      className="gap-1.5"
                    >
                      <GitBranch className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Fork</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Create a new branch from this conversation</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {activeTab === 'search' && (
              <div className="mb-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search in conversation..."
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onKeyDown={handleSearchKeyDown}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} size="sm">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                
                {searchResults.length > 0 ? (
                  <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map(message => (
                      <div 
                        key={message.id}
                        className="p-2 rounded-md bg-muted/50 hover:bg-muted cursor-pointer"
                        onClick={() => onJumpToMessage(message.id)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={message.role === 'user' ? 'default' : 'secondary'} className="text-xs">
                            {message.role}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(message.timestamp, 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm line-clamp-2">{message.content}</p>
                      </div>
                    ))}
                  </div>
                ) : searchQuery.trim() ? (
                  <p className="text-sm text-muted-foreground mt-2">No results found</p>
                ) : null}
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {Object.entries(messagesByDate).map(([date, messagesForDate]) => (
                  <div key={date} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                      <h3 className="text-sm font-medium">
                        {format(new Date(date), 'MMMM d, yyyy')}
                      </h3>
                    </div>
                    
                    <div className="ml-6 border-l border-border pl-4 space-y-2">
                      {messagesForDate.map((message: Message) => (
                        <div 
                          key={message.id}
                          className="flex items-start gap-2 text-sm hover:bg-muted/50 p-1 rounded cursor-pointer"
                          onClick={() => onJumpToMessage(message.id)}
                        >
                          <div className="mt-0.5">
                            {message.role === 'user' ? (
                              <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground">U</div>
                            ) : message.role === 'assistant' ? (
                              <div className="h-4 w-4 rounded-full bg-secondary flex items-center justify-center text-[10px] text-secondary-foreground">A</div>
                            ) : (
                              <div className="h-4 w-4 rounded-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground">S</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium capitalize">{message.role}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(message.timestamp, 'h:mm a')}
                              </span>
                            </div>
                            <p className="line-clamp-1 text-muted-foreground">{message.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {memorySnapshots.length > 0 && (
                  <div className="border-t border-border pt-2 mt-2">
                    <h3 className="text-sm font-medium mb-2">Memory Snapshots</h3>
                    <div className="space-y-2">
                      {memorySnapshots.map(snapshot => (
                        <div key={snapshot.id} className="text-xs p-2 bg-muted/50 rounded">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">Summary</span>
                            <span className="text-muted-foreground">
                              {format(snapshot.timestamp, 'MMM d, h:mm a')}
                            </span>
                          </div>
                          <p className="text-muted-foreground">{snapshot.summary}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'branches' && (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {branches.length > 0 ? (
                  branches.map(branch => (
                    <div key={branch.id} className="p-2 rounded-md bg-muted/50 hover:bg-muted">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium text-sm">{branch.title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(branch.createdAt, 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <Badge variant="outline" className="text-xs">
                          {branch.parentId ? 'Child Branch' : 'Parent Branch'}
                        </Badge>
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                          <MessageSquare className="h-3.5 w-3.5 mr-1" />
                          <span className="text-xs">Open</span>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <GitBranch className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No branches yet</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={handleCreateBranch}
                    >
                      Create Branch
                    </Button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed state indicator */}
      {!isExpanded && (
        <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg mb-4 cursor-pointer" onClick={() => setIsExpanded(true)}>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">View conversation timeline</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

export default ChatTimeline;

function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function formatDateDisplay(date: string): string {
  return format(new Date(date), 'MMMM d, yyyy');
}

function formatTimeDisplay(date: Date): string {
  return format(date, 'h:mm a');
}
