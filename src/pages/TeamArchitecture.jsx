import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useProject } from '@/lib/ProjectContext';
import {
  Sparkles, Plus, Trash2, Edit2, Check, X, Loader2, Users, Map
} from 'lucide-react';
import TeamMap from '@/components/TeamMap';

const statusColors = {
  open: 'bg-amber-100 text-amber-700',
  interviewing: 'bg-blue-100 text-blue-700',
  filled: 'bg-green-100 text-green-700',
};

const priorityColors = {
  critical: 'bg-red-100 text-red-600',
  high: 'bg-orange-100 text-orange-600',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-slate-100 text-slate-600',
};

const RoleCard = ({ role, onEdit, onDelete }) => (
  <div className="bg-white rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="font-serif text-base font-semibold text-foreground">{role.title}</h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{role.description || 'No description'}</p>
      </div>
      <div className="flex items-center gap-1 ml-3 shrink-0">
        <button onClick={() => onEdit(role)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <Edit2 size={13} />
        </button>
        <button onClick={() => onDelete(role.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-500">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
    {role.required_skills && (
      <div className="flex flex-wrap gap-1.5 mb-3">
        {role.required_skills.split(',').slice(0, 4).map((s, i) => (
          <span key={i} className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">{s.trim()}</span>
        ))}
      </div>
    )}
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[role.status] || 'bg-muted text-muted-foreground'}`}>{role.status}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[role.priority] || 'bg-muted text-muted-foreground'}`}>{role.priority}</span>
      </div>
      {role.estimated_compensation && (
        <span className="text-xs text-muted-foreground">${role.estimated_compensation.toLocaleString()}/mo</span>
      )}
    </div>
  </div>
);

const RoleForm = ({ role, onSave, onCancel, projectId }) => {
  const [form, setForm] = useState(role || { title: '', description: '', responsibilities: '', required_skills: '', estimated_compensation: '', status: 'open', priority: 'high', project_id: projectId });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    if (form.id) {
      await base44.entities.TeamRole.update(form.id, form);
    } else {
      await base44.entities.TeamRole.create(form);
    }
    setSaving(false);
    onSave();
  };

  return (
    <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm space-y-3">
      <input className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" placeholder="Role title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
      <textarea className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none" rows={2} placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
      <textarea className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none" rows={2} placeholder="Responsibilities" value={form.responsibilities} onChange={e => setForm(p => ({ ...p, responsibilities: e.target.value }))} />
      <input className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" placeholder="Required skills (comma separated)" value={form.required_skills} onChange={e => setForm(p => ({ ...p, required_skills: e.target.value }))} />
      <div className="grid grid-cols-3 gap-2">
        <input type="number" className="px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" placeholder="Compensation/mo" value={form.estimated_compensation} onChange={e => setForm(p => ({ ...p, estimated_compensation: e.target.value }))} />
        <select className="px-3 py-2 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
          <option value="open">Open</option>
          <option value="interviewing">Interviewing</option>
          <option value="filled">Filled</option>
        </select>
        <select className="px-3 py-2 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-muted transition-colors">Cancel</button>
        <button onClick={handleSave} disabled={!form.title || saving} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-foreground text-background rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40">
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Save Role
        </button>
      </div>
    </div>
  );
};

export default function TeamArchitecture() {
  const { currentProject } = useProject();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editRole, setEditRole] = useState(null);

  useEffect(() => {
    if (!currentProject?.id) return;
    loadRoles();
  }, [currentProject?.id]);

  const loadRoles = async () => {
    const data = await base44.entities.TeamRole.filter({ project_id: currentProject.id });
    setRoles(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.TeamRole.delete(id);
    loadRoles();
  };

  const handleAIGenerate = async () => {
    setGenerating(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert startup team architect. Generate an optimal team structure for this startup.

Project: ${currentProject.name}
Stage: ${currentProject.stage}
Description: ${currentProject.description || 'No description provided'}
Budget: ${currentProject.budget_total ? '$' + currentProject.budget_total : 'Not specified'}

Generate 5-7 essential team roles. Be specific to the project stage and industry.`,
      response_json_schema: {
        type: 'object',
        properties: {
          roles: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                responsibilities: { type: 'string' },
                required_skills: { type: 'string' },
                estimated_compensation: { type: 'number' },
                priority: { type: 'string' },
              }
            }
          }
        }
      }
    });
    await base44.entities.TeamRole.bulkCreate(
      (res.roles || []).map(r => ({ ...r, project_id: currentProject.id, status: 'open' }))
    );
    loadRoles();
    setGenerating(false);
  };

  if (!currentProject) return <div className="text-muted-foreground text-sm">No project selected.</div>;

  const filled = roles.filter(r => r.status === 'filled').length;
  const completion = roles.length > 0 ? Math.round((filled / roles.length) * 100) : 0;

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Team Architecture</h2>
          <p className="text-muted-foreground text-sm mt-1">{roles.length} roles · {filled} filled · {completion}% complete</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAIGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2.5 border border-amber-300 bg-amber-50 text-amber-700 rounded-xl text-sm font-medium hover:bg-amber-100 transition-colors"
          >
            {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {generating ? 'Generating...' : 'AI Design Team'}
          </button>
          <button
            onClick={() => { setEditRole(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-foreground text-background rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={14} /> Add Role
          </button>
        </div>
      </div>

      {/* Visual Team Map */}
      {roles.length > 0 && (
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Map size={16} className="text-amber-500" />
            <h3 className="font-serif text-base font-semibold">Team Architecture Map</h3>
          </div>
          <TeamMap roles={roles} />
        </div>
      )}

      {/* Progress */}
      <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Team Completion</span>
          <span className="text-sm font-semibold text-amber-600">{completion}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all" style={{ width: `${completion}%` }} />
        </div>
      </div>

      {showForm && (
        <RoleForm
          role={editRole}
          projectId={currentProject.id}
          onSave={() => { setShowForm(false); setEditRole(null); loadRoles(); }}
          onCancel={() => { setShowForm(false); setEditRole(null); }}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
      ) : roles.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-60 bg-white rounded-2xl border border-dashed border-border">
          <Users size={32} className="text-muted-foreground mb-3" />
          <h3 className="font-serif text-lg font-medium mb-1">No team roles yet</h3>
          <p className="text-muted-foreground text-sm mb-4">Use AI to design your team or add roles manually</p>
          <button onClick={handleAIGenerate} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
            <Sparkles size={14} /> Design with AI
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map(role => (
            <RoleCard
              key={role.id}
              role={role}
              onEdit={(r) => { setEditRole(r); setShowForm(true); }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}