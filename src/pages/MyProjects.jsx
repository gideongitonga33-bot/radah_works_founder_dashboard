import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useProject } from '@/lib/ProjectContext';
import { useNavigate } from 'react-router-dom';
import {
  Plus, ArrowRight, Archive, FolderOpen, Sparkles,
  ChevronRight, Loader2, X
} from 'lucide-react';
import NewProjectWizard from '@/components/NewProjectWizard';

const stageColors = {
  Idea: 'bg-purple-100 text-purple-700',
  Prototype: 'bg-blue-100 text-blue-700',
  MVP: 'bg-amber-100 text-amber-700',
  Launch: 'bg-green-100 text-green-700',
  Growth: 'bg-emerald-100 text-emerald-700',
};

export default function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const { setCurrentProject } = useProject();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('new') === '1') setShowWizard(true);
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const data = await base44.entities.Project.list('-created_date', 50);
    setProjects(data);
    setLoading(false);
  };

  const handleOpen = (project) => {
    setCurrentProject(project);
    navigate('/Dashboard');
  };

  const handleArchive = async (project) => {
    await base44.entities.Project.update(project.id, { status: 'archived' });
    loadProjects();
  };

  const activeProjects = projects.filter(p => p.status !== 'archived');
  const archivedProjects = projects.filter(p => p.status === 'archived');

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold">My Projects</h2>
          <p className="text-muted-foreground text-sm mt-1">{activeProjects.length} active project{activeProjects.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity shadow-sm"
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Projects', value: activeProjects.length },
          { label: 'In Progress', value: activeProjects.filter(p => ['MVP', 'Launch', 'Growth'].includes(p.stage)).length },
          { label: 'Early Stage', value: activeProjects.filter(p => ['Idea', 'Prototype'].includes(p.stage)).length },
          { label: 'Archived', value: archivedProjects.length },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-border p-4 text-center shadow-sm">
            <div className="text-2xl font-semibold font-sans text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Active Projects */}
      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
      ) : activeProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-60 bg-white rounded-2xl border border-dashed border-border">
          <FolderOpen size={32} className="text-muted-foreground mb-3" />
          <h3 className="font-serif text-lg font-medium mb-1">No projects yet</h3>
          <p className="text-muted-foreground text-sm mb-4">Create your first startup project to get started</p>
          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={14} /> Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeProjects.map(project => (
            <div key={project.id} className="bg-white rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-lg font-semibold text-foreground truncate">{project.name}</h3>
                  <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{project.description || 'No description yet'}</p>
                </div>
                <span className={`ml-3 shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${stageColors[project.stage] || 'bg-muted text-muted-foreground'}`}>
                  {project.stage}
                </span>
              </div>

              {/* Progress bars */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Team</span>
                  <span className="font-medium">{project.team_completion || 0}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${project.team_completion || 0}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Execution</span>
                  <span className="font-medium">{project.execution_progress || 0}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-slate-400 rounded-full transition-all" style={{ width: `${project.execution_progress || 0}%` }} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpen(project)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-foreground text-background rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Open <ArrowRight size={14} />
                </button>
                <button
                  onClick={() => handleArchive(project)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  title="Archive project"
                >
                  <Archive size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showWizard && (
        <NewProjectWizard
          onClose={() => setShowWizard(false)}
          onCreated={(project) => { setCurrentProject(project); navigate('/Dashboard'); }}
        />
      )}
    </div>
  );
}