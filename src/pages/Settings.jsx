import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useProject } from '@/lib/ProjectContext';
import { useNavigate } from 'react-router-dom';
import { Save, Loader2, Trash2, UserPlus, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const stages = ['Idea', 'Prototype', 'MVP', 'Launch', 'Growth'];

export default function Settings() {
  const { currentProject, setCurrentProject } = useProject();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');
  const [showDanger, setShowDanger] = useState(false);
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
    if (currentProject) setForm(currentProject);
  }, [currentProject?.id]);

  const handleSave = async () => {
    if (!currentProject?.id) return;
    setSaving(true);
    await base44.entities.Project.update(currentProject.id, form);
    setCurrentProject({ ...currentProject, ...form });
    await base44.entities.Activity.create({
      project_id: currentProject.id, type: 'note',
      title: 'Project settings updated', description: `Updated by ${user?.full_name || 'founder'}`
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    await base44.users.inviteUser(inviteEmail, 'user');
    setInviteMsg(`Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
    setInviting(false);
    setTimeout(() => setInviteMsg(''), 3000);
  };

  const handleArchive = async () => {
    setArchiving(true);
    await base44.entities.Project.update(currentProject.id, { status: 'archived' });
    setCurrentProject(null);
    navigate('/MyProjects');
  };

  if (!currentProject) return <div className="text-muted-foreground text-sm">No project selected.</div>;

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Project Settings</h2>
        <p className="text-muted-foreground text-sm mt-1">Configure {currentProject.name}</p>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4">
        <h3 className="font-serif text-base font-semibold">Project Details</h3>
        <div>
          <label className="block text-sm font-medium mb-1.5">Project Name</label>
          <input className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Stage</label>
          <div className="flex gap-2 flex-wrap">
            {stages.map(s => (
              <button key={s} onClick={() => setForm(p => ({ ...p, stage: s }))} className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${form.stage === s ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5">Monthly Budget (USD)</label>
            <input type="number" className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" value={form.budget_total || ''} onChange={e => setForm(p => ({ ...p, budget_total: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Monthly Budget Allocated (USD)</label>
            <input type="number" className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" value={form.budget_allocated || ''} onChange={e => setForm(p => ({ ...p, budget_allocated: parseFloat(e.target.value) || 0 }))} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5">Team Completion %</label>
            <input type="number" min="0" max="100" className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" value={form.team_completion || ''} onChange={e => setForm(p => ({ ...p, team_completion: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Execution %</label>
            <input type="number" min="0" max="100" className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" value={form.execution_progress || ''} onChange={e => setForm(p => ({ ...p, execution_progress: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Investor Score %</label>
            <input type="number" min="0" max="100" className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" value={form.investor_readiness_score || ''} onChange={e => setForm(p => ({ ...p, investor_readiness_score: parseFloat(e.target.value) || 0 }))} />
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Invite Collaborator */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-3">
        <h3 className="font-serif text-base font-semibold flex items-center gap-2"><UserPlus size={16} /> Invite Collaborator</h3>
        <p className="text-sm text-muted-foreground">Invite a co-founder or team member to access this workspace.</p>
        <div className="flex gap-2">
          <input
            type="email"
            className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="colleague@email.com"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleInvite()}
          />
          <button onClick={handleInvite} disabled={inviting || !inviteEmail}
            className="flex items-center gap-2 px-4 py-2.5 bg-foreground text-background rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-40">
            {inviting ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />} Invite
          </button>
        </div>
        {inviteMsg && <p className="text-sm text-green-600 font-medium">{inviteMsg}</p>}
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border border-red-100 p-6 shadow-sm space-y-3">
        <button onClick={() => setShowDanger(!showDanger)} className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700">
          <AlertTriangle size={16} /> Danger Zone {showDanger ? '▲' : '▼'}
        </button>
        {showDanger && (
          <div className="space-y-3 pt-2 border-t border-red-100">
            <p className="text-sm text-muted-foreground">Archiving will hide this project from your active workspace. You can unarchive from My Projects.</p>
            <button onClick={handleArchive} disabled={archiving}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-100 disabled:opacity-40">
              {archiving ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} Archive Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
}