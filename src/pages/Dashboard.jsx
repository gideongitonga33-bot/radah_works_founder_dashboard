import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useProject } from '@/lib/ProjectContext';
import { Link } from 'react-router-dom';
import {
  Users, TrendingUp, AlertTriangle, DollarSign,
  ArrowRight, CheckCircle2, Clock, Zap, Target,
  Sparkles, Activity, Plus, FileText, UserSearch, MapPin
} from 'lucide-react';

const StatCard = ({ icon: IconEl, label, value, sub, color = 'amber', href }) => {
  const Icon = IconEl;
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

const quickActions = [
  { label: 'Add Milestone', IconComp: Plus, href: '/ProjectExecution', color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
  { label: 'Find Candidates', IconComp: UserSearch, href: '/CandidatePipeline', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
  { label: 'Update Brief', IconComp: FileText, href: '/ProjectDescription', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
  { label: 'Investor Report', IconComp: TrendingUp, href: '/InvestorReadiness', color: 'bg-green-50 text-green-600 hover:bg-green-100' },
];

export default function Dashboard() {
  const { currentProject } = useProject();
  const [roles, setRoles] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [activities, setActivities] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [aiPulse, setAiPulse] = useState('');
  const [loadingPulse, setLoadingPulse] = useState(false);

  useEffect(() => {
    if (!currentProject?.id) return;
    Promise.all([
      base44.entities.TeamRole.filter({ project_id: currentProject.id }),
      base44.entities.Milestone.filter({ project_id: currentProject.id }),
      base44.entities.Activity.filter({ project_id: currentProject.id }, '-created_date', 8),
      base44.entities.Candidate.filter({ project_id: currentProject.id }),
    ]).then(([r, m, a, c]) => { setRoles(r); setMilestones(m); setActivities(a); setCandidates(c); });
  }, [currentProject?.id]);

  const handleAIPulse = async () => {
    setLoadingPulse(true);
    const openRoles = roles.filter(r => r.status !== 'filled').length;
    const completed = milestones.filter(m => m.status === 'completed').length;
    const blocked = milestones.filter(m => m.status === 'blocked').length;
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a startup advisor. Give a concise 2-sentence strategic pulse for this startup right now:

Project: ${currentProject.name} (${currentProject.stage} stage)
Team completion: ${currentProject.team_completion || 0}%
Execution progress: ${currentProject.execution_progress || 0}%
Investor readiness: ${currentProject.investor_readiness_score || 0}%
Open roles: ${openRoles}, Milestones completed: ${completed}/${milestones.length}, Blockers: ${blocked}
Candidates in pipeline: ${candidates.length}

Give one insight about where they stand and one specific action they should take today. Be direct and actionable.`
    });
    setAiPulse(res);
    setLoadingPulse(false);
  };

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

  const activityIcons = {
    milestone: '🏁', candidate: '👤', role: '💼', document: '📄', note: '📝', investor: '💰'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-foreground">Mission Control</h2>
          <p className="text-muted-foreground text-sm mt-1">Here's the status of <span className="text-foreground font-medium">{currentProject.name}</span></p>
        </div>
        <button
          onClick={handleAIPulse}
          disabled={loadingPulse}
          className="flex items-center gap-2 px-4 py-2.5 border border-amber-300 bg-amber-50 text-amber-700 rounded-xl text-sm font-medium hover:bg-amber-100 transition-colors disabled:opacity-60"
        >
          {loadingPulse ? <Clock size={14} className="animate-spin" /> : <Sparkles size={14} />}
          AI Pulse
        </button>
      </div>

      {/* AI Pulse */}
      {aiPulse && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <Sparkles size={18} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-900 leading-relaxed">{aiPulse}</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map(a => (
          <Link key={a.label} to={a.href} className={`flex items-center gap-2.5 p-3 rounded-xl text-sm font-medium transition-all ${a.color}`}>
            <a.IconComp size={16} />
            {a.label}
          </Link>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Open Roles" value={openRoles} sub={`${filledRoles} filled`} color="blue" href="/TeamArchitecture" />
        <StatCard icon={Target} label="Next Milestone" value={nextMilestone ? nextMilestone.title.substring(0, 20) + (nextMilestone.title.length > 20 ? '…' : '') : '—'} sub={nextMilestone?.due_date || 'No active milestones'} color="amber" href="/ProjectExecution" />
        <StatCard icon={AlertTriangle} label="Blockers" value={blockers} sub={blockers > 0 ? 'Needs attention' : 'All clear'} color={blockers > 0 ? 'red' : 'green'} href="/ProjectExecution" />
        <StatCard icon={DollarSign} label="Budget Used" value={budgetTotal ? `$${(budgetUsed / 1000).toFixed(0)}k` : '—'} sub={budgetTotal ? `of $${(budgetTotal / 1000).toFixed(0)}k total` : 'Not set'} color="green" href="/ProjectExecution" />
      </div>

      {/* Health + Investor Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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

        <div className="bg-gradient-to-br from-[hsl(220,25%,12%)] to-[hsl(220,20%,22%)] rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-amber-400" />
            <h3 className="font-serif text-base font-semibold">Investor Readiness</h3>
          </div>
          <div className="text-5xl font-bold font-sans mb-1">
            {currentProject.investor_readiness_score || 0}
            <span className="text-2xl text-amber-400/70">%</span>
          </div>
          <p className="text-slate-400 text-sm mb-4">
            {(currentProject.investor_readiness_score || 0) < 40 ? 'Early stage — focus on traction' :
             (currentProject.investor_readiness_score || 0) < 70 ? 'Making progress — build deck' : 'Strong position — pitch ready'}
          </p>
          <Link to="/InvestorReadiness" className="inline-flex items-center gap-1.5 text-amber-400 text-sm hover:text-amber-300 transition-colors">
            View readiness report <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Milestones + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
              {milestones.slice(0, 5).map(m => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    m.status === 'completed' ? 'bg-green-500' :
                    m.status === 'in_progress' ? 'bg-amber-500' :
                    m.status === 'blocked' ? 'bg-red-500' : 'bg-slate-300'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{m.title}</div>
                    <div className="text-xs text-muted-foreground">{m.due_date || 'No date set'}</div>
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0">
                    {m.status === 'completed' ? <CheckCircle2 size={14} className="text-green-500" /> :
                     m.status === 'in_progress' ? <Clock size={14} className="text-amber-500" /> :
                     <div className="w-10 h-1.5 bg-muted rounded-full overflow-hidden">
                       <div className="h-full bg-amber-400 rounded-full" style={{ width: `${m.progress || 0}%` }} />
                     </div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-muted-foreground" />
            <h3 className="font-serif text-base font-semibold">Activity Feed</h3>
          </div>
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm space-y-2">
              <p>No recent activity yet.</p>
              <p className="text-xs">Actions across the platform will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map(a => (
                <div key={a.id} className="flex items-start gap-3">
                  <span className="text-lg shrink-0 leading-none mt-0.5">{activityIcons[a.type] || '📌'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{a.title}</div>
                    {a.description && <div className="text-xs text-muted-foreground mt-0.5">{a.description}</div>}
                    <div className="text-xs text-muted-foreground/60 mt-0.5">
                      {new Date(a.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roles.filter(r => r.status !== 'filled').slice(0, 6).map(r => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-white border border-border flex items-center justify-center">
                  <Users size={14} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{r.title}</div>
                  <div className="text-xs text-muted-foreground capitalize">{r.status?.replace('_', ' ')}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                  r.priority === 'critical' ? 'bg-red-100 text-red-600' :
                  r.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{r.priority}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}