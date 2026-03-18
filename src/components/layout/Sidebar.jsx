import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, FileText, Users, UserSearch,
  MapPin, TrendingUp, FolderOpen, UsersRound,
  FileStack, Settings, ChevronLeft, ChevronRight, Zap, BarChart3
} from 'lucide-react';
import ProjectSwitcher from './ProjectSwitcher';

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, path: '/Dashboard' },
  { label: 'Project Brief', icon: FileText, path: '/ProjectDescription' },
  { label: 'Team Architecture', icon: Users, path: '/TeamArchitecture' },
  { label: 'Candidates', icon: UserSearch, path: '/CandidatePipeline' },
  { label: 'Execution', icon: MapPin, path: '/ProjectExecution' },
  { label: 'Investor Readiness', icon: TrendingUp, path: '/InvestorReadiness' },
];

const secondaryItems = [
  { label: 'My Projects', icon: FolderOpen, path: '/MyProjects' },
  { label: 'Team Members', icon: UsersRound, path: '/TeamMembers' },
  { label: 'Team Performance', icon: BarChart3, path: '/TeamPerformance' },
  { label: 'Documents', icon: FileStack, path: '/Documents' },
  { label: 'Settings', icon: Settings, path: '/Settings' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();

  const NavItem = ({ item }) => {
    const active = location.pathname === item.path;
    return (
      <Link
        to={item.path}
        title={collapsed ? item.label : undefined}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative',
          collapsed ? 'justify-center' : '',
          active
            ? 'bg-amber-500/20 text-amber-400 font-medium'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
        )}
      >
        <item.icon size={18} className={cn('shrink-0', active ? 'text-amber-400' : '')} />
        {!collapsed && <span className="text-sm">{item.label}</span>}
        {collapsed && (
          <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl">
            {item.label}
          </div>
        )}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 h-screen flex flex-col z-40 transition-all duration-300',
        'bg-[hsl(220,25%,12%)] border-r border-white/5',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-2 px-4 py-5 border-b border-white/5', collapsed && 'justify-center px-2')}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
          <Zap size={14} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-semibold text-sm leading-none">Radah Works</div>
            <div className="text-amber-400/70 text-xs mt-0.5">Command Center</div>
          </div>
        )}
      </div>

      {/* Project Switcher */}
      {!collapsed && <ProjectSwitcher />}

      {/* Main Nav */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        <div className="mb-3">
          {!collapsed && <div className="text-xs text-slate-500 uppercase tracking-widest px-3 mb-2">Workspace</div>}
          {navItems.map(item => <NavItem key={item.path} item={item} />)}
        </div>
        <div className={cn('pt-3 border-t border-white/5', collapsed ? 'mt-2' : '')}>
          {!collapsed && <div className="text-xs text-slate-500 uppercase tracking-widest px-3 mb-2">General</div>}
          {secondaryItems.map(item => <NavItem key={item.path} item={item} />)}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center w-full py-4 border-t border-white/5 text-slate-500 hover:text-slate-300 transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}