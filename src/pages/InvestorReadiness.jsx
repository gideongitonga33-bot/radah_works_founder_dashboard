import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useProject } from '@/lib/ProjectContext';
import { Sparkles, TrendingUp, Loader2, Save, FileText, BarChart3, Users, DollarSign } from 'lucide-react';

const ScoreSection = ({ label, score, description }) => (
  <div className="flex items-center gap-4">
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm font-semibold text-amber-600">{score}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{
          width: `${score}%`,
          background: score >= 70 ? 'hsl(142,71%,45%)' : score >= 40 ? 'hsl(38,92%,50%)' : 'hsl(0,72%,51%)'
        }} />
      </div>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </div>
  </div>
);

export default function InvestorReadiness() {
  const { currentProject, setCurrentProject } = useProject();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [activeTab, setActiveTab] = useState('score');

  if (!currentProject) return <div className="text-muted-foreground text-sm">No project selected.</div>;

  const score = currentProject.investor_readiness_score || 0;

  const sections = [
    { label: 'Problem & Market Clarity', score: currentProject.problem_statement ? 85 : 20, description: currentProject.problem_statement ? 'Well defined' : 'Complete your problem statement' },
    { label: 'Value Proposition', score: currentProject.value_proposition ? 80 : 15, description: currentProject.value_proposition ? 'Defined' : 'Define your value proposition' },
    { label: 'Team Architecture', score: currentProject.team_completion || 10, description: `${currentProject.team_completion || 0}% of team roles filled` },
    { label: 'Revenue Model', score: currentProject.revenue_model ? 75 : 20, description: currentProject.revenue_model ? 'Defined' : 'Add revenue model details' },
    { label: 'Execution Progress', score: currentProject.execution_progress || 5, description: `${currentProject.execution_progress || 0}% milestones complete` },
  ];

  const avgScore = Math.round(sections.reduce((s, sec) => s + sec.score, 0) / sections.length);

  const handleRecalculate = async () => {
    await base44.entities.Project.update(currentProject.id, { investor_readiness_score: avgScore });
    setCurrentProject({ ...currentProject, investor_readiness_score: avgScore });
  };

  const handleGenerate = async (type) => {
    setGenerating(true);
    setActiveTab('document');
    const prompts = {
      summary: `Write a professional investor summary for this startup. Use executive language and be compelling.

Project: ${currentProject.name}
Stage: ${currentProject.stage}
Description: ${currentProject.description || ''}
Problem: ${currentProject.problem_statement || ''}
Value Proposition: ${currentProject.value_proposition || ''}
Revenue Model: ${currentProject.revenue_model || ''}
Target Market: ${currentProject.target_market || ''}

Write a 3-paragraph investor summary that covers: the problem & opportunity, the solution & traction, and the ask & vision.`,

      onepager: `Create a professional one-pager document for investor outreach for this startup.

Project: ${currentProject.name}
Stage: ${currentProject.stage}  
Description: ${currentProject.description || ''}

Format it with clear sections: Overview, Problem, Solution, Market, Business Model, Team Needs, and Why Now.`,

      brief: `Write a concise executive brief for this startup that can be sent to potential investors.

Project: ${currentProject.name}
Stage: ${currentProject.stage}
Description: ${currentProject.description || ''}
Value Proposition: ${currentProject.value_proposition || ''}

Make it punchy and professional. Highlight the key differentiators and investment opportunity.`,
    };

    const res = await base44.integrations.Core.InvokeLLM({ prompt: prompts[type] });
    setGeneratedContent(res);
    setGenerating(false);
  };

  const tabs = [
    { id: 'score', label: 'Readiness Score', icon: BarChart3 },
    { id: 'documents', label: 'AI Documents', icon: FileText },
    { id: 'document', label: 'Generated', icon: Sparkles },
  ];

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Investor Readiness</h2>
          <p className="text-muted-foreground text-sm mt-1">Track your fundraising readiness and generate materials</p>
        </div>
        <button onClick={handleRecalculate} className="flex items-center gap-2 px-4 py-2.5 bg-foreground text-background rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
          <TrendingUp size={14} /> Recalculate Score
        </button>
      </div>

      {/* Score Hero */}
      <div className="bg-gradient-to-br from-[hsl(220,25%,12%)] to-[hsl(220,20%,22%)] rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-amber-400/70 text-sm mb-2">Investor Readiness Score</div>
            <div className="text-6xl font-bold font-sans">{score}<span className="text-3xl text-amber-400/70">%</span></div>
            <p className="text-slate-400 text-sm mt-2 max-w-xs">
              {score < 30 ? 'Early stage. Focus on defining your problem and market.' :
               score < 50 ? 'Making progress. Build out your team and refine your model.' :
               score < 70 ? 'Strong foundation. Work on traction and financial projections.' :
               score < 85 ? 'Looking good. Polish your deck and practice your pitch.' :
               'Investor ready. You\'re in strong position to fundraise.'}
            </p>
          </div>
          <div className="w-24 h-24 rounded-full border-4 border-amber-400/30 flex items-center justify-center">
            <div className="text-amber-400 text-2xl font-bold">{score >= 70 ? '✓' : score >= 40 ? '→' : '!'}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'score' && (
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-5">
          <h3 className="font-serif text-base font-semibold">Score Breakdown</h3>
          {sections.map(s => <ScoreSection key={s.label} {...s} />)}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 gap-3">
          {[
            { type: 'summary', title: 'Investor Summary', desc: 'A compelling 3-paragraph overview for investor outreach', icon: Users },
            { type: 'onepager', title: 'One-Pager', desc: 'Clean document covering all key aspects of your startup', icon: FileText },
            { type: 'brief', title: 'Executive Brief', desc: 'Punchy, professional brief highlighting your differentiators', icon: BarChart3 },
          ].map(doc => (
            <div key={doc.type} className="bg-white rounded-2xl border border-border p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <doc.icon size={20} className="text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-base font-semibold">{doc.title}</h3>
                <p className="text-sm text-muted-foreground">{doc.desc}</p>
              </div>
              <button
                onClick={() => handleGenerate(doc.type)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
              >
                <Sparkles size={13} /> Generate
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'document' && (
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          {generating ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <Loader2 size={28} className="animate-spin text-amber-500" />
              <p className="text-sm text-muted-foreground">AI is crafting your investor document...</p>
            </div>
          ) : generatedContent ? (
            <div className="prose prose-sm max-w-none text-foreground leading-relaxed whitespace-pre-wrap text-sm">
              {generatedContent}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Sparkles size={28} className="mx-auto mb-3 text-amber-400" />
              <p className="text-sm">Select a document to generate from the AI Documents tab</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}