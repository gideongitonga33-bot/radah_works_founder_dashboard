import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useProject } from '@/lib/ProjectContext';
import {
  UserSearch, Sparkles, Star, Calendar, X,
  Loader2, UserCheck, Plus, Check, Edit2, Trash2
} from 'lucide-react';

const statusConfig = {
  recommended: { label: 'Recommended', color: 'bg-purple-100 text-purple-700' },
  shortlisted: { label: 'Shortlisted', color: 'bg-blue-100 text-blue-700' },
  interview_scheduled: { label: 'Interview', color: 'bg-amber-100 text-amber-700' },
  selected: { label: 'Selected', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-600' },
};

const CandidateCard = ({ candidate, onUpdate, onDelete }) => {
  const config = statusConfig[candidate.status] || statusConfig.recommended;
  return (
    <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white font-semibold text-sm shrink-0">
          {candidate.name?.[0] || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="font-medium text-sm text-foreground">{candidate.name}</div>
            <div className="flex items-center gap-1">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${config.color}`}>{config.label}</span>
              <button onClick={() => onDelete(candidate.id)} className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
                <X size={10} />
              </button>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">{candidate.title}</div>
          {candidate.summary && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{candidate.summary}</p>}
          {candidate.skills && (
            <div className="flex flex-wrap gap-1 mt-2">
              {candidate.skills.split(',').slice(0, 3).map((s, i) => (
                <span key={i} className="text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground">{s.trim()}</span>
              ))}
            </div>
          )}
          {candidate.score && (
            <div className="flex items-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={11} className={i < Math.round(candidate.score / 20) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'} />
              ))}
              <span className="text-xs text-muted-foreground ml-1">{candidate.score}/100</span>
            </div>
          )}
          {candidate.interview_date && (
            <div className="flex items-center gap-1 mt-1.5 text-xs text-amber-600">
              <Calendar size={11} /> Interview: {candidate.interview_date}
            </div>
          )}
          {candidate.interview_notes && (
            <p className="mt-1.5 text-xs text-muted-foreground italic border-l-2 border-amber-200 pl-2">{candidate.interview_notes}</p>
          )}
        </div>
      </div>
      <div className="flex gap-1.5 mt-3">
        {candidate.status !== 'shortlisted' && candidate.status !== 'selected' && candidate.status !== 'rejected' && (
          <button onClick={() => onUpdate(candidate.id, { status: 'shortlisted' })} className="flex-1 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">Shortlist</button>
        )}
        {candidate.status === 'shortlisted' && (
          <button onClick={() => onUpdate(candidate.id, { status: 'interview_scheduled' })} className="flex-1 py-1.5 text-xs bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors flex items-center justify-center gap-1">
            <Calendar size={11} /> Schedule
          </button>
        )}
        {candidate.status === 'interview_scheduled' && (
          <button onClick={() => onUpdate(candidate.id, { status: 'selected' })} className="flex-1 py-1.5 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-1">
            <UserCheck size={11} /> Select
          </button>
        )}
        {candidate.status !== 'rejected' && (
          <button onClick={() => onUpdate(candidate.id, { status: 'rejected' })} className="py-1.5 px-2 text-xs bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors">
            <X size={11} />
          </button>
        )}
      </div>
    </div>
  );
};

const AddCandidateForm = ({ roles, projectId, onSave, onCancel }) => {
  const [form, setForm] = useState({ name: '', title: '', skills: '', summary: '', availability: '', score: 80, status: 'recommended', role_id: roles[0]?.id || '', project_id: projectId });
  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Candidate.create(form);
    setSaving(false);
    onSave();
  };
  return (
    <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm space-y-3">
      <h3 className="font-serif text-base font-semibold">Add Candidate</h3>
      <div className="grid grid-cols-2 gap-2">
        <input className="px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="Full name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        <input className="px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="Current title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
      </div>
      <select className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400" value={form.role_id} onChange={e => setForm(p => ({ ...p, role_id: e.target.value }))}>
        {roles.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
      </select>
      <input className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="Skills (comma separated)" value={form.skills} onChange={e => setForm(p => ({ ...p, skills: e.target.value }))} />
      <textarea className="w-full px-3 py-2 rounded-xl border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400" rows={2} placeholder="Profile summary" value={form.summary} onChange={e => setForm(p => ({ ...p, summary: e.target.value }))} />
      <div className="grid grid-cols-2 gap-2">
        <input className="px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="Availability" value={form.availability} onChange={e => setForm(p => ({ ...p, availability: e.target.value }))} />
        <input type="number" min="0" max="100" className="px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="Score (0-100)" value={form.score} onChange={e => setForm(p => ({ ...p, score: parseInt(e.target.value) || 0 }))} />
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-muted">Cancel</button>
        <button onClick={handleSave} disabled={!form.name || saving} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-foreground text-background rounded-xl hover:opacity-90 disabled:opacity-40">
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Add
        </button>
      </div>
    </div>
  );
};

export default function CandidatePipeline() {
  const { currentProject } = useProject();
  const [roles, setRoles] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (!currentProject?.id) return;
    Promise.all([
      base44.entities.TeamRole.filter({ project_id: currentProject.id }),
      base44.entities.Candidate.filter({ project_id: currentProject.id }),
    ]).then(([r, c]) => {
      setRoles(r);
      setCandidates(c);
      if (r.length > 0 && !selectedRole) setSelectedRole(r[0]);
    }).finally(() => setLoading(false));
  }, [currentProject?.id]);

  const handleUpdate = async (id, data) => {
    await base44.entities.Candidate.update(id, data);
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    if (data.status === 'selected') {
      await base44.entities.Activity.create({
        project_id: currentProject.id, type: 'candidate',
        title: `Candidate selected`, description: `A candidate was selected for ${selectedRole?.title || 'a role'}`
      });
    }
  };

  const handleDelete = async (id) => {
    await base44.entities.Candidate.delete(id);
    setCandidates(prev => prev.filter(c => c.id !== id));
  };

  const handleAIGenerate = async () => {
    if (!selectedRole) return;
    setGenerating(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate 3 realistic vetted candidate profiles for this startup role.

Role: ${selectedRole.title}
Description: ${selectedRole.description || ''}
Required Skills: ${selectedRole.required_skills || ''}
Project: ${currentProject.name} (${currentProject.stage} stage)

Create professional, realistic candidates with strong backgrounds appropriate for a startup. Include name, current title, summary, skills, availability, and a score out of 100.`,
      response_json_schema: {
        type: 'object',
        properties: {
          candidates: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                title: { type: 'string' },
                summary: { type: 'string' },
                skills: { type: 'string' },
                availability: { type: 'string' },
                score: { type: 'number' },
              }
            }
          }
        }
      }
    });
    const newCandidates = (res.candidates || []).map(c => ({ ...c, project_id: currentProject.id, role_id: selectedRole.id, status: 'recommended' }));
    await base44.entities.Candidate.bulkCreate(newCandidates);
    await base44.entities.Activity.create({
      project_id: currentProject.id, type: 'candidate',
      title: `AI found ${newCandidates.length} candidates`, description: `For role: ${selectedRole.title}`
    });
    const fresh = await base44.entities.Candidate.filter({ project_id: currentProject.id });
    setCandidates(fresh);
    setGenerating(false);
  };

  if (!currentProject) return <div className="text-muted-foreground text-sm">No project selected.</div>;

  const roleCandidates = candidates.filter(c => c.role_id === selectedRole?.id);
  const allSelected = candidates.filter(c => c.status === 'selected').length;

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Candidate Pipeline</h2>
          <p className="text-muted-foreground text-sm mt-1">{candidates.length} candidates · {allSelected} selected</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors">
            <Plus size={14} /> Add Candidate
          </button>
          <button onClick={handleAIGenerate} disabled={generating || !selectedRole}
            className="flex items-center gap-2 px-4 py-2.5 border border-amber-300 bg-amber-50 text-amber-700 rounded-xl text-sm font-medium hover:bg-amber-100 transition-colors disabled:opacity-40">
            {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {generating ? 'Finding...' : 'Find with AI'}
          </button>
        </div>
      </div>

      {/* Role Tabs */}
      {roles.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {roles.map(role => (
            <button key={role.id} onClick={() => setSelectedRole(role)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedRole?.id === role.id ? 'bg-foreground text-background' : 'bg-white border border-border text-foreground hover:bg-muted'}`}>
              {role.title}
              <span className="ml-2 text-xs opacity-60">{candidates.filter(c => c.role_id === role.id).length}</span>
            </button>
          ))}
        </div>
      )}

      {showAddForm && (
        <AddCandidateForm
          roles={roles}
          projectId={currentProject.id}
          onSave={async () => { setShowAddForm(false); const fresh = await base44.entities.Candidate.filter({ project_id: currentProject.id }); setCandidates(fresh); }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
      ) : roles.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-60 bg-white rounded-2xl border border-dashed border-border text-center">
          <UserSearch size={32} className="text-muted-foreground mb-3" />
          <h3 className="font-serif text-lg font-medium mb-1">No roles defined yet</h3>
          <p className="text-muted-foreground text-sm">Design your team architecture first to find candidates.</p>
        </div>
      ) : roleCandidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-60 bg-white rounded-2xl border border-dashed border-border text-center px-4">
          <UserSearch size={32} className="text-muted-foreground mb-3" />
          <h3 className="font-serif text-lg font-medium mb-1">No candidates for {selectedRole?.title}</h3>
          <p className="text-muted-foreground text-sm mb-4">Use AI to find vetted candidates or add manually</p>
          <button onClick={handleAIGenerate} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
            <Sparkles size={14} /> Find Candidates
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['recommended', 'shortlisted', 'interview_scheduled', 'selected'].map(status => {
            const statusCands = roleCandidates.filter(c => c.status === status);
            const conf = statusConfig[status];
            return (
              <div key={status}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${conf.color}`}>{conf.label}</span>
                  <span className="text-xs text-muted-foreground">{statusCands.length}</span>
                </div>
                <div className="space-y-3">
                  {statusCands.map(c => (
                    <CandidateCard key={c.id} candidate={c} onUpdate={handleUpdate} onDelete={handleDelete} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}