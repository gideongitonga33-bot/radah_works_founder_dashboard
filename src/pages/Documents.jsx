import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useProject } from '@/lib/ProjectContext';
import { FileText, Download, Sparkles, Loader2, FileStack, Clock, RefreshCw } from 'lucide-react';

const docTypes = [
  { id: 'project_blueprint', label: 'Project Blueprint', icon: FileText, desc: 'Complete project definition document' },
  { id: 'team_brief', label: 'Team Architecture Brief', icon: FileStack, desc: 'Full team structure with role descriptions' },
  { id: 'investor_summary', label: 'Investor Summary', icon: Sparkles, desc: 'Executive summary for fundraising' },
  { id: 'execution_plan', label: 'Execution Plan', icon: Clock, desc: 'Milestone-based delivery roadmap' },
];

export default function Documents() {
  const { currentProject } = useProject();
  const [roles, setRoles] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [generating, setGenerating] = useState(null);
  const [savedDocs, setSavedDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDoc, setActiveDoc] = useState(null); // { title, content }

  useEffect(() => {
    if (!currentProject?.id) { setLoading(false); return; }
    Promise.all([
      base44.entities.TeamRole.filter({ project_id: currentProject.id }),
      base44.entities.Milestone.filter({ project_id: currentProject.id }),
      base44.entities.SavedDocument.filter({ project_id: currentProject.id }),
    ]).then(([r, m, d]) => { setRoles(r); setMilestones(m); setSavedDocs(d); }).finally(() => setLoading(false));
  }, [currentProject?.id]);

  const handleGenerate = async (docType) => {
    if (!currentProject) return;
    setGenerating(docType.id);

    const prompts = {
      project_blueprint: `Create a comprehensive Project Blueprint for this startup:

Project: ${currentProject.name} | Stage: ${currentProject.stage}
Vision: ${currentProject.description || ''}
Problem: ${currentProject.problem_statement || ''}
Target Market: ${currentProject.target_market || ''}
Value Proposition: ${currentProject.value_proposition || ''}
Revenue Model: ${currentProject.revenue_model || ''}
MVP Scope: ${currentProject.mvp_scope || ''}
Success Metrics: ${currentProject.success_metrics || ''}

Format as a professional document: Executive Summary, Problem & Opportunity, Solution, Target Market, Business Model, Go-to-Market, Success Metrics. Use markdown.`,

      team_brief: `Create a Team Architecture Brief:

Project: ${currentProject.name} | Stage: ${currentProject.stage}
Roles: ${roles.map(r => `${r.title} (${r.status}, $${r.estimated_compensation || 0}/yr): ${r.description || ''}`).join('\n')}

Format professionally: Team Overview, Org Structure, Role Descriptions, Hiring Priority, Compensation Summary. Use markdown.`,

      investor_summary: `Write a compelling investor summary:

Project: ${currentProject.name} | Stage: ${currentProject.stage}
Description: ${currentProject.description || ''}
Problem: ${currentProject.problem_statement || ''}
Value Proposition: ${currentProject.value_proposition || ''}
Revenue Model: ${currentProject.revenue_model || ''}
Budget: $${currentProject.budget_total || 0}
Investor Readiness: ${currentProject.investor_readiness_score || 0}%

Write a 1-page investor summary: Headline, Problem, Solution, Market Size, Business Model, Traction, Team, The Ask. Make it compelling and investment-ready.`,

      execution_plan: `Create a detailed Execution Plan:

Project: ${currentProject.name} | Stage: ${currentProject.stage}
Milestones: ${milestones.map(m => `${m.title} (${m.status}, due: ${m.due_date || 'TBD'}, $${m.budget_allocated || 0}): ${m.description || ''}`).join('\n')}
Total Budget: $${currentProject.budget_total || 0}

Format: Executive Overview, Timeline summary, Milestone Details, Budget Allocation table, Risk Register, Success Criteria. Use markdown.`,
    };

    const content = await base44.integrations.Core.InvokeLLM({ prompt: prompts[docType.id] });

    // Save or update
    const existing = savedDocs.find(d => d.doc_type === docType.id);
    let saved;
    if (existing) {
      saved = await base44.entities.SavedDocument.update(existing.id, { content });
      setSavedDocs(prev => prev.map(d => d.id === existing.id ? { ...d, content } : d));
    } else {
      saved = await base44.entities.SavedDocument.create({
        project_id: currentProject.id, doc_type: docType.id, title: docType.label, content,
      });
      setSavedDocs(prev => [...prev, saved]);
    }

    await base44.entities.Activity.create({
      project_id: currentProject.id, type: 'document',
      title: `Document generated: ${docType.label}`, description: 'Auto-saved to Documents'
    });

    setActiveDoc({ title: docType.label, content });
    setGenerating(null);
  };

  const handleDownload = (content, label) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${label.replace(/ /g, '_')}_${currentProject?.name?.replace(/ /g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!currentProject) return <div className="text-muted-foreground text-sm">No project selected.</div>;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Documents</h2>
        <p className="text-muted-foreground text-sm mt-1">AI-generated project documents · {savedDocs.length} saved</p>
      </div>

      {/* Document generators */}
      <div className="grid grid-cols-1 gap-4">
        {docTypes.map(docType => {
          const isGenerating = generating === docType.id;
          const saved = savedDocs.find(d => d.doc_type === docType.id);
          return (
            <div key={docType.id} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 p-5">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <docType.icon size={20} className="text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-base font-semibold">{docType.label}</h3>
                  <p className="text-sm text-muted-foreground">{docType.desc}</p>
                  {saved && <span className="text-xs text-green-600 font-medium">✓ Saved</span>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {saved && (
                    <>
                      <button onClick={() => setActiveDoc({ title: docType.label, content: saved.content })}
                        className="px-3 py-2 text-sm border border-border rounded-xl hover:bg-muted transition-colors text-muted-foreground">
                        View
                      </button>
                      <button onClick={() => handleDownload(saved.content, docType.label)}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-xl hover:bg-muted transition-colors text-muted-foreground">
                        <Download size={13} />
                      </button>
                    </>
                  )}
                  <button onClick={() => handleGenerate(docType)} disabled={isGenerating}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60">
                    {isGenerating ? <Loader2 size={13} className="animate-spin" /> : saved ? <RefreshCw size={13} /> : <Sparkles size={13} />}
                    {isGenerating ? 'Generating...' : saved ? 'Regen' : 'Generate'}
                  </button>
                </div>
              </div>

              {isGenerating && (
                <div className="border-t border-border px-5 py-8 flex items-center justify-center gap-3 bg-muted/20">
                  <Loader2 size={18} className="animate-spin text-amber-500" />
                  <span className="text-sm text-muted-foreground">AI is writing your document...</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Preview Panel */}
      {activeDoc && (
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="font-serif text-base font-semibold">{activeDoc.title}</h3>
            <div className="flex gap-2">
              <button onClick={() => handleDownload(activeDoc.content, activeDoc.title)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors">
                <Download size={12} /> Export .md
              </button>
              <button onClick={() => setActiveDoc(null)} className="text-xs px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                Close
              </button>
            </div>
          </div>
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <pre className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-sans">{activeDoc.content}</pre>
          </div>
        </div>
      )}
    </div>
  );
}