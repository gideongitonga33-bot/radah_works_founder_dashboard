import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, ArrowRight, ArrowLeft, Sparkles, Loader2, Check } from 'lucide-react';

const stages = ['Idea', 'Prototype', 'MVP', 'Launch', 'Growth'];

export default function NewProjectWizard({ onClose, onCreated }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', stage: 'Idea', description: '', budget_total: '',
  });
  const [aiTeam, setAiTeam] = useState([]);

  const update = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleGenerateTeam = async () => {
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert startup team architect. Based on this startup project, generate the optimal founding team structure.

Project: ${form.name}
Stage: ${form.stage}
Description: ${form.description}

Return 5-7 essential roles for this startup at the ${form.stage} stage. Be specific and practical.`,
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
    setAiTeam(res.roles || []);
    setLoading(false);
    setStep(5);
  };

  const handleFinish = async () => {
    setLoading(true);
    const project = await base44.entities.Project.create({
      name: form.name,
      stage: form.stage,
      description: form.description,
      budget_total: form.budget_total ? parseFloat(form.budget_total) : 0,
      status: 'active',
      team_completion: 0,
      execution_progress: 0,
      investor_readiness_score: 0,
    });
    if (aiTeam.length > 0) {
      await base44.entities.TeamRole.bulkCreate(
        aiTeam.map(r => ({ ...r, project_id: project.id }))
      );
    }
    setLoading(false);
    onCreated(project);
  };

  const canAdvance = () => {
    if (step === 1) return form.name.trim().length > 0;
    if (step === 2) return form.stage.length > 0;
    if (step === 3) return form.description.trim().length > 10;
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-[hsl(220,25%,12%)] to-[hsl(220,20%,22%)] p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              <span className="text-amber-400 text-sm font-medium">AI Project Setup</span>
            </div>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
              <X size={14} />
            </button>
          </div>
          <div className="text-xl font-serif font-semibold">
            {step === 1 && 'What are you building?'}
            {step === 2 && 'What stage are you at?'}
            {step === 3 && 'Describe your project'}
            {step === 4 && 'What\'s your budget?'}
            {step === 5 && 'Your AI-designed team'}
          </div>
          {/* Progress */}
          <div className="flex gap-1.5 mt-4">
            {[1, 2, 3, 4, 5].map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= step ? 'bg-amber-400' : 'bg-white/20'}`} />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Project Name</label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                placeholder="e.g. AI Legal Assistant, Fintech Platform..."
                value={form.name}
                onChange={e => update('name', e.target.value)}
                autoFocus
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Startup Stage</label>
              <div className="grid grid-cols-5 gap-2">
                {stages.map(s => (
                  <button
                    key={s}
                    onClick={() => update('stage', s)}
                    className={`py-3 rounded-xl text-sm font-medium transition-all ${form.stage === s ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">What does your startup do?</label>
              <textarea
                className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all resize-none"
                rows={5}
                placeholder="Describe your startup's mission, the problem you solve, and who your customers are..."
                value={form.description}
                onChange={e => update('description', e.target.value)}
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Initial Budget (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <input
                  type="number"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                  placeholder="50000"
                  value={form.budget_total}
                  onChange={e => update('budget_total', e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">This helps AI recommend the right team size and seniority levels.</p>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              {loading ? (
                <div className="flex flex-col items-center py-10 gap-3">
                  <Loader2 size={28} className="animate-spin text-amber-500" />
                  <p className="text-sm text-muted-foreground">AI is designing your team architecture...</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {aiTeam.map((role, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} className="text-amber-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{role.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{role.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={14} /> Back
            </button>
          ) : <div />}

          {step < 4 && (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canAdvance()}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40 ml-auto"
            >
              Continue <ArrowRight size={14} />
            </button>
          )}

          {step === 4 && (
            <button
              onClick={handleGenerateTeam}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity ml-auto"
            >
              <Sparkles size={14} /> Generate Team with AI
            </button>
          )}

          {step === 5 && !loading && (
            <button
              onClick={handleFinish}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-xl font-medium text-sm hover:opacity-90 transition-opacity ml-auto"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Launch Project
            </button>
          )}
        </div>
      </div>
    </div>
  );
}