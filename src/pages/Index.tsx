
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import EnhancedChatInterface from '@/components/chat/EnhancedChatInterface';
import MobileFriendlyChatInterface from '@/components/chat/MobileFriendlyChatInterface';
import useChat from '@/hooks/useChat';

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    createNewSession,
  } = useChat();

  // Check if the device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex w-full neural-app-bg">
      {/* Overlay when sidebar is open on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSessionSelect={setCurrentSessionId}
        onNewSession={createNewSession}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Header toggleSidebar={toggleSidebar} />

        <main className="flex-1 pt-16 flex flex-col">
          <div className="flex-1 overflow-hidden">
            {isMobile ? (
              <MobileFriendlyChatInterface toggleSidebar={toggleSidebar} />
            ) : (
              <EnhancedChatInterface />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
