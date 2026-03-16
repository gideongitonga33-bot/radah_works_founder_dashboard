import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useProject } from '@/lib/ProjectContext';
import { FileText, Download, Sparkles, Loader2, ChevronRight, FileStack, Clock } from 'lucide-react';

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
  const [docs, setDocs] = useState({});

  useEffect(() => {
    if (!currentProject?.id) return;
    Promise.all([
      base44.entities.TeamRole.filter({ project_id: currentProject.id }),
      base44.entities.Milestone.filter({ project_id: currentProject.id }),
    ]).then(([r, m]) => { setRoles(r); setMilestones(m); });
  }, [currentProject?.id]);

  const handleGenerate = async (docType) => {
    if (!currentProject) return;
    setGenerating(docType.id);

    const prompts = {
      project_blueprint: `Create a comprehensive Project Blueprint document for this startup:

Project: ${currentProject.name} | Stage: ${currentProject.stage}
Vision: ${currentProject.description || ''}
Problem: ${currentProject.problem_statement || ''}
Target Market: ${currentProject.target_market || ''}
Value Proposition: ${currentProject.value_proposition || ''}
Revenue Model: ${currentProject.revenue_model || ''}
MVP Scope: ${currentProject.mvp_scope || ''}
Success Metrics: ${currentProject.success_metrics || ''}

Format as a professional document with sections: Executive Summary, Problem & Opportunity, Solution, Target Market, Business Model, Go-to-Market, Success Metrics, and Appendix. Use markdown formatting.`,

      team_brief: `Create a Team Architecture Brief for this startup:

Project: ${currentProject.name} | Stage: ${currentProject.stage}
Roles: ${roles.map(r => `${r.title} (${r.status}, $${r.estimated_compensation || 0}/yr): ${r.description}`).join('\n')}

Format as a professional document covering: Team Overview, Org Structure, Role Descriptions, Hiring Priority, Compensation Summary, and Culture Notes. Use markdown.`,

      investor_summary: `Write a compelling investor summary document for this startup:

Project: ${currentProject.name} | Stage: ${currentProject.stage}
Description: ${currentProject.description || ''}
Problem: ${currentProject.problem_statement || ''}
Value Proposition: ${currentProject.value_proposition || ''}
Revenue Model: ${currentProject.revenue_model || ''}
Budget: $${currentProject.budget_total || 0} total
Investor Readiness: ${currentProject.investor_readiness_score || 0}%

Write a 1-page investor summary with: Headline, Problem, Solution, Market Size, Business Model, Traction, Team, and The Ask. Make it compelling and investment-ready.`,

      execution_plan: `Create a detailed Execution Plan document for this startup:

Project: ${currentProject.name} | Stage: ${currentProject.stage}
Milestones: ${milestones.map(m => `${m.title} (${m.status}, due: ${m.due_date || 'TBD'}, $${m.budget_allocated || 0}): ${m.description}`).join('\n')}
Total Budget: $${currentProject.budget_total || 0}

Format as a professional execution plan with: Executive Overview, Timeline Gantt summary, Milestone Details, Budget Allocation table, Risk Register, and Success Criteria. Use markdown.`,
    };

    const content = await base44.integrations.Core.InvokeLLM({ prompt: prompts[docType.id] });
    setDocs(prev => ({ ...prev, [docType.id]: content }));
    setGenerating(null);
  };

  const handleDownload = (docId, label) => {
    const content = docs[docId];
    if (!content) return;
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
    <div className="max-w-4xl space-y-5">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Documents</h2>
        <p className="text-muted-foreground text-sm mt-1">AI-generated project documents for {currentProject.name}</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {docTypes.map(docType => {
          const isGenerating = generating === docType.id;
          const hasDoc = !!docs[docType.id];
          return (
            <div key={docType.id} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 p-5">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <docType.icon size={20} className="text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-base font-semibold">{docType.label}</h3>
                  <p className="text-sm text-muted-foreground">{docType.desc}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {hasDoc && (
                    <button
                      onClick={() => handleDownload(docType.id, docType.label)}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-xl hover:bg-muted transition-colors text-muted-foreground"
                    >
                      <Download size={13} /> Export
                    </button>
                  )}
                  <button
                    onClick={() => handleGenerate(docType)}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
                  >
                    {isGenerating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                    {isGenerating ? 'Generating...' : hasDoc ? 'Regenerate' : 'Generate'}
                  </button>
                </div>
              </div>

              {isGenerating && (
                <div className="border-t border-border px-5 py-8 flex items-center justify-center gap-3 bg-muted/20">
                  <Loader2 size={18} className="animate-spin text-amber-500" />
                  <span className="text-sm text-muted-foreground">AI is writing your document...</span>
                </div>
              )}

              {hasDoc && !isGenerating && (
                <div className="border-t border-border px-5 py-5 max-h-72 overflow-y-auto">
                  <pre className="text-xs text-foreground leading-relaxed whitespace-pre-wrap font-sans">{docs[docType.id]}</pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}