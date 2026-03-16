import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useProject } from '@/lib/ProjectContext';
import { Link } from 'react-router-dom';
import {
  Users, TrendingUp, AlertTriangle, DollarSign,
  ArrowRight, CheckCircle2, Clock, Zap, Target, BarChart3
} from 'lucide-react';
const StatCard = ({ icon: Icon, label, value, sub, color = 'amber', href }) => {
  const colors = {
    amber: 'text-amber-500 bg-amber-50',
    blue: 'text-blue-500 bg-blue-50',
    green: 'text-green-500 bg-green-50',
    red: 'text-red-500 bg-red-50',
  };
  return (
    <div className="bg-white rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon size={18} />
        </div>
        {href && (
          <Link to={href} className="text-xs text-muted-foreground hover:text-amber-500 flex items-center gap-1 transition-colors">
            View <ArrowRight size={12} />
          </Link>
        )}
      </div>
      <div className="mt-4">
        <div className="text-2xl font-semibold text-foreground font-sans">{value}</div>
        <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1 opacity-70">{sub}</div>}
      </div>
    </div>
  );
};

const ProgressRing = ({ value, label, color }) => {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const offset = circ - ((value || 0) / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg width="80" height="80" className="-rotate-90">
          <circle cx="40" cy="40" r={r} fill="none" stroke="hsl(40,10%,92%)" strokeWidth="6" />
          <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-foreground">{value || 0}%</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground text-center">{label}</span>
    </div>
  );
};

export default function Dashboard() {
  const { currentProject } = useProject();
  const [roles, setRoles] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentProject?.id) { setLoading(false); return; }
    Promise.all([
      base44.entities.TeamRole.filter({ project_id: currentProject.id }),
      base44.entities.Milestone.filter({ project_id: currentProject.id }),
    ]).then(([r, m]) => { setRoles(r); setMilestones(m); }).finally(() => setLoading(false));
  }, [currentProject?.id]);

  if (!currentProject) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
          <Zap size={28} className="text-amber-500" />
        </div>
        <h2 className="font-serif text-2xl font-semibold mb-2">Welcome to Radah Works</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">Your startup execution command center. Start by creating your first project.</p>
        <Link to="/MyProjects?new=1" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity">
          Create First Project <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  const openRoles = roles.filter(r => r.status === 'open').length;
  const filledRoles = roles.filter(r => r.status === 'filled').length;
  const nextMilestone = milestones.find(m => m.status === 'in_progress' || m.status === 'not_started');
  const blockers = milestones.filter(m => m.status === 'blocked').length;
  const budgetUsed = currentProject.budget_allocated || 0;
  const budgetTotal = currentProject.budget_total || 0;
  const budgetPercent = budgetTotal > 0 ? Math.round((budgetUsed / budgetTotal) * 100) : 0;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Welcome */}
      <div>
        <h2 className="font-serif text-2xl font-semibold text-foreground">Mission Control</h2>
        <p className="text-muted-foreground text-sm mt-1">Here's the status of <span className="text-foreground font-medium">{currentProject.name}</span></p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Open Roles" value={openRoles} sub={`${filledRoles} filled`} color="blue" href="/TeamArchitecture" />
        <StatCard icon={Target} label="Next Milestone" value={nextMilestone?.title || '—'} sub={nextMilestone?.due_date || 'No active milestones'} color="amber" href="/ProjectExecution" />
        <StatCard icon={AlertTriangle} label="Blockers" value={blockers} sub={blockers > 0 ? 'Needs attention' : 'All clear'} color={blockers > 0 ? 'red' : 'green'} href="/ProjectExecution" />
        <StatCard icon={DollarSign} label="Budget Used" value={budgetTotal ? `$${(budgetUsed / 1000).toFixed(0)}k` : '—'} sub={budgetTotal ? `of $${(budgetTotal / 1000).toFixed(0)}k total` : 'Not set'} color="green" href="/ProjectExecution" />
      </div>

      {/* Health + Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Startup Health */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-lg font-semibold">Startup Health</h3>
            <span className="text-xs text-muted-foreground px-2.5 py-1 bg-muted rounded-full">{currentProject.stage}</span>
          </div>
          <div className="flex items-center justify-around">
            <ProgressRing value={currentProject.team_completion || 0} label="Team Complete" color="hsl(38,92%,50%)" />
            <ProgressRing value={currentProject.execution_progress || 0} label="Execution" color="hsl(220,25%,35%)" />
            <ProgressRing value={currentProject.investor_readiness_score || 0} label="Investor Ready" color="hsl(142,71%,45%)" />
            <ProgressRing value={budgetPercent} label="Budget Used" color="hsl(197,71%,50%)" />
          </div>
        </div>

        {/* Investor Readiness */}
        <div className="bg-gradient-to-br from-[hsl(220,25%,12%)] to-[hsl(220,20%,22%)] rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-amber-400" />
            <h3 className="font-serif text-base font-semibold">Investor Readiness</h3>
          </div>
          <div className="text-5xl font-bold font-sans mb-1">{currentProject.investor_readiness_score || 0}<span className="text-2xl text-amber-400/70">%</span></div>
          <p className="text-slate-400 text-sm mb-4">
            {(currentProject.investor_readiness_score || 0) < 40 ? 'Early stage — focus on traction' :
             (currentProject.investor_readiness_score || 0) < 70 ? 'Making progress — build deck' : 'Strong position — pitch ready'}
          </p>
          <Link to="/InvestorReadiness" className="inline-flex items-center gap-1.5 text-amber-400 text-sm hover:text-amber-300 transition-colors">
            View readiness report <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Milestones + Open Roles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Milestones */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-base font-semibold">Milestones</h3>
            <Link to="/ProjectExecution" className="text-xs text-amber-500 hover:text-amber-600 flex items-center gap-1">View all <ArrowRight size={12} /></Link>
          </div>
          {milestones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No milestones yet. <Link to="/ProjectExecution" className="text-amber-500 hover:underline">Add milestones →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {milestones.slice(0, 4).map(m => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    m.status === 'completed' ? 'bg-green-500' :
                    m.status === 'in_progress' ? 'bg-amber-500' :
                    m.status === 'blocked' ? 'bg-red-500' : 'bg-slate-300'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{m.title}</div>
                    <div className="text-xs text-muted-foreground">{m.due_date || 'No date set'}</div>
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0">
                    {m.status === 'completed' ? <CheckCircle2 size={14} className="text-green-500" /> :
                     m.status === 'in_progress' ? <Clock size={14} className="text-amber-500" /> :
                     <div className="w-10 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-amber-400 rounded-full" style={{ width: `${m.progress || 0}%` }} /></div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Open Roles */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-base font-semibold">Open Roles</h3>
            <Link to="/TeamArchitecture" className="text-xs text-amber-500 hover:text-amber-600 flex items-center gap-1">View all <ArrowRight size={12} /></Link>
          </div>
          {roles.filter(r => r.status !== 'filled').length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No open roles. <Link to="/TeamArchitecture" className="text-amber-500 hover:underline">Design team →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {roles.filter(r => r.status !== 'filled').slice(0, 4).map(r => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-white border border-border flex items-center justify-center">
                    <Users size={14} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{r.title}</div>
                    <div className="text-xs text-muted-foreground capitalize">{r.status?.replace('_', ' ')}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    r.priority === 'critical' ? 'bg-red-100 text-red-600' :
                    r.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                  }`}>{r.priority}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}