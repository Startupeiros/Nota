import React, { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar component */}
      <Sidebar 
        isMobile={isMobile}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Top header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Main content area */}
        <main className="flex-1 pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
