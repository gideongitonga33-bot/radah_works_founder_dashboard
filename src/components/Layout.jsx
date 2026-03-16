import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './layout/Sidebar';
import TopBar from './layout/TopBar';
import { cn } from '@/lib/utils';
import { ProjectProvider } from '@/lib/ProjectContext';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <ProjectProvider>
      <div className="min-h-screen bg-background flex">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <div className={cn('flex-1 flex flex-col transition-all duration-300 min-h-screen', collapsed ? 'ml-16' : 'ml-60')}>
          <TopBar />
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </ProjectProvider>
  );
}