import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useProject } from '@/lib/ProjectContext';
import {
  Users, CheckCircle2, Clock, AlertTriangle, TrendingUp,
  Plus, Loader2, Sparkles, BarChart3, Target, Star, Trash2
} from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// ─── Member Form ────────────────────────────────────────────────────────────
const MemberForm = ({ projectId, roles, onSave, onCancel }) => {
  const [form, setForm] = useState({ project_id: projectId, name: '', role_title: '', email: '', status: 'active' });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.TeamMember.create(form);
    setSaving(false);
    onSave();
  };

  return (
    <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm space-y-3">
      <h3 className="font-serif text-base font-semibold">Add Team Member</h3>
      <div className="grid grid-cols-2 gap-3">
        <input className="px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="Full name" value={form.name} onChange={e => set('name', e.target.value)} />
        <input className="px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="Email" value={form.email} onChange={e => set('email', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input className="px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="Role title" value={form.role_title} onChange={e => set('role_title', e.target.value)} />
        <select className="px-3 py-2 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400" value={form.status} onChange={e => set('status', e.target.value)}>
          <option value="active">Active</option>
          <option value="part_time">Part Time</option>
          <option value="on_leave">On Leave</option>
          <option value="departed">Departed</option>
        </select>
      </div>
      <input className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" type="date" placeholder="Start date" value={form.start_date || ''} onChange={e => set('start_date', e.target.value)} />
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-muted transition-colors">Cancel</button>
        <button onClick={handleSave} disabled={!form.name || !form.role_title || saving}
          className="flex items-center gap-1.5 px-4 py-2 text-sm bg-foreground text-background rounded-xl hover:opacity-90 disabled:opacity-40">
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Add Member
        </button>
      </div>
    </div>
  );
};

// ─── Task Form ───────────────────────────────────────────────────────────────
const TaskForm = ({ projectId, members, milestones, onSave, onCancel }) => {
  const [form, setForm] = useState({ project_id: projectId, title: '', status: 'todo', priority: 'medium', estimated_hours: '', assigned_to_name: '' });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Task.create(form);
    setSaving(false);
    onSave();
  };

  return (
    <div className="bg-white rounded-2xl border border-blue-200 p-5 shadow-sm space-y-3">
      <h3 className="font-serif text-base font-semibold">Add Task</h3>
      <input className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="Task title" value={form.title} onChange={e => set('title', e.target.value)} />
      <textarea className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" rows={2} placeholder="Description" value={form.description || ''} onChange={e => set('description', e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <select className="px-3 py-2 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400" value={form.assigned_to_name} onChange={e => set('assigned_to_name', e.target.value)}>
          <option value="">Unassigned</option>
          {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
        </select>
        <select className="px-3 py-2 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400" value={form.milestone_id || ''} onChange={e => set('milestone_id', e.target.value)}>
          <option value="">No milestone</option>
          {milestones.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <select className="px-3 py-2 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400" value={form.status} onChange={e => set('status', e.target.value)}>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
          <option value="blocked">Blocked</option>
        </select>
        <select className="px-3 py-2 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400" value={form.priority} onChange={e => set('priority', e.target.value)}>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <input type="number" className="px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="Est. hrs" value={form.estimated_hours} onChange={e => set('estimated_hours', parseFloat(e.target.value) || '')} />
      </div>
      <input type="date" className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" value={form.due_date || ''} onChange={e => set('due_date', e.target.value)} />
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-muted transition-colors">Cancel</button>
        <button onClick={handleSave} disabled={!form.title || saving}
          className="flex items-center gap-1.5 px-4 py-2 text-sm bg-foreground text-background rounded-xl hover:opacity-90 disabled:opacity-40">
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Add Task
        </button>
      </div>
    </div>
  );
};

// ─── Member Card ─────────────────────────────────────────────────────────────
const MemberCard = ({ member, tasks, onDelete }) => {
  const myTasks = tasks.filter(t => t.assigned_to_name === member.name);
  const done = myTasks.filter(t => t.status === 'done').length;
  const inProgress = myTasks.filter(t => t.status === 'in_progress').length;
  const blocked = myTasks.filter(t => t.status === 'blocked').length;
  const completionRate = myTasks.length > 0 ? Math.round((done / myTasks.length) * 100) : 0;

  const now = new Date();
  const overdue = myTasks.filter(t => t.due_date && t.status !== 'done' && new Date(t.due_date) < now).length;
  const onTime = myTasks.filter(t => t.status === 'done' && (!t.due_date || new Date(t.completed_date || t.updated_date) <= new Date(t.due_date))).length;
  const onTimeRate = done > 0 ? Math.round((onTime / done) * 100) : 100;

  const statusColors = { active: 'bg-green-100 text-green-700', part_time: 'bg-blue-100 text-blue-700', on_leave: 'bg-amber-100 text-amber-700', departed: 'bg-slate-100 text-slate-500' };

  const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="bg-white rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold">
            {initials}
          </div>
          <div>
            <div className="font-semibold text-sm text-foreground">{member.name}</div>
            <div className="text-xs text-muted-foreground">{member.role_title}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[member.status] || 'bg-muted text-muted-foreground'}`}>{member.status?.replace('_', ' ')}</span>
          <button onClick={() => onDelete(member.id)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 rounded-xl bg-muted/40">
          <div className="text-lg font-bold text-foreground">{completionRate}%</div>
          <div className="text-xs text-muted-foreground">Done</div>
        </div>
        <div className="text-center p-2 rounded-xl bg-muted/40">
          <div className="text-lg font-bold text-foreground">{onTimeRate}%</div>
          <div className="text-xs text-muted-foreground">On Time</div>
        </div>
        <div className={`text-center p-2 rounded-xl ${overdue > 0 ? 'bg-red-50' : 'bg-muted/40'}`}>
          <div className={`text-lg font-bold ${overdue > 0 ? 'text-red-600' : 'text-foreground'}`}>{overdue}</div>
          <div className="text-xs text-muted-foreground">Overdue</div>
        </div>
      </div>

      {/* Task breakdown */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Tasks ({myTasks.length} total)</span>
          <span className="text-green-600 font-medium">{done} done</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden flex">
          {myTasks.length > 0 && <>
            <div className="h-full bg-green-500 transition-all" style={{ width: `${(done / myTasks.length) * 100}%` }} />
            <div className="h-full bg-amber-400 transition-all" style={{ width: `${(inProgress / myTasks.length) * 100}%` }} />
            <div className="h-full bg-red-400 transition-all" style={{ width: `${(blocked / myTasks.length) * 100}%` }} />
          </>}
        </div>
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{done} done</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />{inProgress} active</span>
          {blocked > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />{blocked} blocked</span>}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TeamPerformance() {
  const { currentProject } = useProject();
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [aiInsight, setAiInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    if (!currentProject?.id) { setLoading(false); return; }
    loadAll();
  }, [currentProject?.id]);

  const loadAll = async () => {
    setLoading(true);
    const [m, t, ms] = await Promise.all([
      base44.entities.TeamMember.filter({ project_id: currentProject.id }),
      base44.entities.Task.filter({ project_id: currentProject.id }),
      base44.entities.Milestone.filter({ project_id: currentProject.id }),
    ]);
    setMembers(m); setTasks(t); setMilestones(ms);
    setLoading(false);
  };

  const handleDeleteMember = async (id) => {
    await base44.entities.TeamMember.delete(id);
    loadAll();
  };

  const handleTaskStatusChange = async (task, newStatus) => {
    await base44.entities.Task.update(task.id, {
      status: newStatus,
      ...(newStatus === 'done' ? { completed_date: new Date().toISOString().split('T')[0] } : {})
    });
    loadAll();
  };

  const handleDeleteTask = async (id) => {
    await base44.entities.Task.delete(id);
    loadAll();
  };

  const handleAIInsight = async () => {
    setLoadingInsight(true);
    const memberStats = members.map(m => {
      const mt = tasks.filter(t => t.assigned_to_name === m.name);
      const done = mt.filter(t => t.status === 'done').length;
      return `${m.name} (${m.role_title}): ${done}/${mt.length} tasks done`;
    }).join(', ');

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a team performance advisor. Analyze this team data for the project "${currentProject.name}":

Team: ${memberStats || 'No team data yet'}
Total tasks: ${tasks.length}, Done: ${tasks.filter(t => t.status === 'done').length}, Blocked: ${tasks.filter(t => t.status === 'blocked').length}
Milestones: ${milestones.length}, Completed: ${milestones.filter(m => m.status === 'completed').length}

Give 2-3 specific, actionable insights on team performance and what the team should focus on next. Be direct.`
    });
    setAiInsight(res);
    setLoadingInsight(false);
  };

  if (!currentProject) return <div className="text-muted-foreground text-sm">No project selected.</div>;

  // Chart data
  const memberChartData = members.map(m => {
    const mt = tasks.filter(t => t.assigned_to_name === m.name);
    const done = mt.filter(t => t.status === 'done').length;
    const inProgress = mt.filter(t => t.status === 'in_progress').length;
    return { name: m.name.split(' ')[0], done, inProgress, total: mt.length };
  });

  const radarData = [
    { metric: 'Task Completion', value: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0 },
    { metric: 'On Schedule', value: milestones.length > 0 ? Math.round((milestones.filter(m => m.status === 'completed').length / milestones.length) * 100) : 0 },
    { metric: 'Team Coverage', value: members.length > 0 ? Math.min(100, members.filter(m => m.status === 'active').length * 20) : 0 },
    { metric: 'No Blockers', value: tasks.length > 0 ? Math.round(((tasks.length - tasks.filter(t => t.status === 'blocked').length) / tasks.length) * 100) : 100 },
    { metric: 'Execution', value: currentProject.execution_progress || 0 },
  ];

  const tabs = ['overview', 'members', 'tasks'];

  const totalDone = tasks.filter(t => t.status === 'done').length;
  const totalBlocked = tasks.filter(t => t.status === 'blocked').length;
  const totalInProgress = tasks.filter(t => t.status === 'in_progress').length;
  const now = new Date();
  const overdueCount = tasks.filter(t => t.due_date && t.status !== 'done' && new Date(t.due_date) < now).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Team Performance</h2>
          <p className="text-muted-foreground text-sm mt-1">{members.length} members · {tasks.length} tasks tracked</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleAIInsight} disabled={loadingInsight}
            className="flex items-center gap-2 px-4 py-2.5 border border-amber-300 bg-amber-50 text-amber-700 rounded-xl text-sm font-medium hover:bg-amber-100 transition-colors disabled:opacity-60">
            {loadingInsight ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            AI Insight
          </button>
          <button onClick={() => setShowMemberForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-foreground text-background rounded-xl text-sm font-medium hover:opacity-90">
            <Plus size={14} /> Add Member
          </button>
        </div>
      </div>

      {/* AI Insight */}
      {aiInsight && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <Sparkles size={16} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-900 leading-relaxed">{aiInsight}</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Tasks Done', value: totalDone, sub: `of ${tasks.length} total`, icon: CheckCircle2, color: 'text-green-500 bg-green-50' },
          { label: 'In Progress', value: totalInProgress, sub: 'active now', icon: Clock, color: 'text-blue-500 bg-blue-50' },
          { label: 'Blocked', value: totalBlocked, sub: totalBlocked > 0 ? 'needs attention' : 'all clear', icon: AlertTriangle, color: totalBlocked > 0 ? 'text-red-500 bg-red-50' : 'text-green-500 bg-green-50' },
          { label: 'Overdue', value: overdueCount, sub: overdueCount > 0 ? 'past due date' : 'on track', icon: TrendingUp, color: overdueCount > 0 ? 'text-orange-500 bg-orange-50' : 'text-green-500 bg-green-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-border p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon size={16} />
            </div>
            <div className="text-2xl font-bold text-foreground">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
            <div className="text-xs text-muted-foreground/70 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === t ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Forms */}
      {showMemberForm && <MemberForm projectId={currentProject.id} roles={[]} onSave={() => { setShowMemberForm(false); loadAll(); }} onCancel={() => setShowMemberForm(false)} />}
      {showTaskForm && <TaskForm projectId={currentProject.id} members={members} milestones={milestones} onSave={() => { setShowTaskForm(false); loadAll(); }} onCancel={() => setShowTaskForm(false)} />}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Radar */}
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Target size={16} className="text-amber-500" />
              <h3 className="font-serif text-base font-semibold">Team Health Radar</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(40,10%,88%)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: 'hsl(220,10%,45%)' }} />
                <Radar dataKey="value" stroke="hsl(38,92%,50%)" fill="hsl(38,92%,50%)" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart */}
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={16} className="text-amber-500" />
              <h3 className="font-serif text-base font-semibold">Tasks by Member</h3>
            </div>
            {memberChartData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">Add members and tasks to see chart</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={memberChartData} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,10%,92%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="done" fill="hsl(142,71%,45%)" name="Done" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="inProgress" fill="hsl(38,92%,50%)" name="In Progress" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        loading ? <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div> :
        members.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 bg-white rounded-2xl border border-dashed border-border">
            <Users size={32} className="text-muted-foreground mb-3" />
            <h3 className="font-serif text-lg font-medium mb-1">No team members yet</h3>
            <p className="text-muted-foreground text-sm mb-4">Add your first team member to start tracking</p>
            <button onClick={() => setShowMemberForm(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-medium hover:opacity-90">
              <Plus size={14} /> Add Member
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map(m => <MemberCard key={m.id} member={m} tasks={tasks} onDelete={handleDeleteMember} />)}
          </div>
        )
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={() => setShowTaskForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-foreground text-background rounded-xl text-sm font-medium hover:opacity-90">
              <Plus size={14} /> Add Task
            </button>
          </div>
          {loading ? <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div> :
          tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 bg-white rounded-2xl border border-dashed border-border">
              <Star size={28} className="text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm">No tasks yet. Add tasks to track team work.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Task</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Assigned To</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Due</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Priority</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, i) => {
                    const isOverdue = task.due_date && task.status !== 'done' && new Date(task.due_date) < now;
                    const statusColors = { todo: 'bg-slate-100 text-slate-600', in_progress: 'bg-blue-100 text-blue-700', done: 'bg-green-100 text-green-700', blocked: 'bg-red-100 text-red-600' };
                    const priorityColors = { critical: 'text-red-600', high: 'text-orange-600', medium: 'text-amber-600', low: 'text-slate-400' };
                    return (
                      <tr key={task.id} className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{task.title}</div>
                          {task.description && <div className="text-xs text-muted-foreground truncate max-w-xs">{task.description}</div>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{task.assigned_to_name || '—'}</td>
                        <td className="px-4 py-3">
                          <select
                            className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400 ${statusColors[task.status]}`}
                            value={task.status}
                            onChange={e => handleTaskStatusChange(task, e.target.value)}
                          >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="done">Done</option>
                            <option value="blocked">Blocked</option>
                          </select>
                        </td>
                        <td className={`px-4 py-3 text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                          {task.due_date || '—'}{isOverdue && ' ⚠'}
                        </td>
                        <td className={`px-4 py-3 text-xs font-medium capitalize ${priorityColors[task.priority]}`}>{task.priority}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleDeleteTask(task.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}