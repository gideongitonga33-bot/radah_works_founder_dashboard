import { Bell, ChevronDown, Sparkles, Sun, Moon, LogOut } from 'lucide-react';
import { useProject } from '@/lib/ProjectContext';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';

const stageColors = {
  Idea: 'bg-purple-100 text-purple-700',
  Prototype: 'bg-blue-100 text-blue-700',
  MVP: 'bg-amber-100 text-amber-700',
  Launch: 'bg-green-100 text-green-700',
  Growth: 'bg-emerald-100 text-emerald-700',
};

export default function TopBar({ title }) {
  const { currentProject } = useProject();
  const { user } = useAuth();
  const [dark, setDark] = useState(() => localStorage.getItem('radah_dark') === 'true');
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('radah_dark', dark);
  }, [dark]);

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <h1 className="font-serif text-xl font-semibold text-foreground">
          {title || currentProject?.name || 'Dashboard'}
        </h1>
        {currentProject?.stage && (
          <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full font-sans', stageColors[currentProject.stage] || 'bg-muted text-muted-foreground')}>
            {currentProject.stage}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all">
          <Sparkles size={14} className="text-amber-500" />
          <span className="hidden sm:inline">AI Assistant</span>
        </button>
        <button
          onClick={() => setDark(!dark)}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          title="Toggle dark mode"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-border hover:bg-muted transition-colors">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
        </button>
        <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-semibold">
            {user?.full_name?.[0] || 'F'}
          </div>
          <span className="hidden sm:block text-sm font-medium text-foreground">{user?.full_name?.split(' ')[0] || 'Founder'}</span>
          <ChevronDown size={14} className="text-muted-foreground hidden sm:block" />
        </button>
      </div>
    </header>
  );
}