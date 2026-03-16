import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useProject } from '@/lib/ProjectContext';
import { Save, Loader2 } from 'lucide-react';

const stages = ['Idea', 'Prototype', 'MVP', 'Launch', 'Growth'];

export default function Settings() {
  const { currentProject, setCurrentProject } = useProject();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (currentProject) setForm(currentProject);
  }, [currentProject?.id]);

  const handleSave = async () => {
    if (!currentProject?.id) return;
    setSaving(true);
    await base44.entities.Project.update(currentProject.id, form);
    setCurrentProject({ ...currentProject, ...form });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!currentProject) return <div className="text-muted-foreground text-sm">No project selected.</div>;

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Project Settings</h2>
        <p className="text-muted-foreground text-sm mt-1">Configure your project details</p>
      </div>
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4">
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
        <div>
          <label className="block text-sm font-medium mb-1.5">Total Budget (USD)</label>
          <input type="number" className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" value={form.budget_total || ''} onChange={e => setForm(p => ({ ...p, budget_total: parseFloat(e.target.value) || 0 }))} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Budget Allocated (USD)</label>
          <input type="number" className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" value={form.budget_allocated || ''} onChange={e => setForm(p => ({ ...p, budget_allocated: parseFloat(e.target.value) || 0 }))} />
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}