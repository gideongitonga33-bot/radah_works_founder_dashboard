import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Plus, Check, Archive } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { useProject } from '@/lib/ProjectContext';

export default function ProjectSwitcher() {
  const { currentProject, setCurrentProject } = useProject();
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    base44.entities.Project.filter({ status: 'active' }).then(setProjects);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative px-3 py-3 border-b border-white/5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="text-xs text-slate-500 mb-0.5">Project</div>
          <div className="text-sm text-slate-200 font-medium truncate">
            {currentProject?.name || 'Select Project'}
          </div>
        </div>
        <ChevronDown size={14} className={cn('text-slate-400 transition-transform shrink-0', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute left-3 right-3 top-full mt-1 bg-[hsl(220,20%,16%)] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-1">
            {projects.map(p => (
              <button
                key={p.id}
                onClick={() => { setCurrentProject(p); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-left transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-200 truncate">{p.name}</div>
                  <div className="text-xs text-slate-500">{p.stage}</div>
                </div>
                {currentProject?.id === p.id && <Check size={14} className="text-amber-400 shrink-0" />}
              </button>
            ))}
          </div>
          <div className="border-t border-white/10 p-1">
            <a
              href="/MyProjects?new=1"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-amber-400 text-sm transition-colors"
            >
              <Plus size={14} />
              New Project
            </a>
          </div>
        </div>
      )}
    </div>
  );
}