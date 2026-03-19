import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useProject } from '@/lib/ProjectContext';
import { Sparkles, Save, Loader2, ChevronDown, ChevronUp, Download } from 'lucide-react';

const Section = ({ label, field, value, onChange, placeholder, aiHelp }) => {
  const [expanded, setExpanded] = useState(true);
  const [generating, setGenerating] = useState(false);

  const handleAI = async () => {
    setGenerating(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert AI Product Manager. Help improve this ${label} for a startup project.
Current content: "${value || 'empty'}"
Please provide a concise, professional, improved version. Be specific and actionable. Max 3 paragraphs.`,
    });
    onChange(res);
    setGenerating(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
      >
        <span className="font-serif text-base font-semibold text-foreground">{label}</span>
        {expanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
      </button>
      {expanded && (
        <div className="px-5 pb-5">
          <textarea
            className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all resize-none"
            rows={4}
            placeholder={placeholder}
            value={value || ''}
            onChange={e => onChange(e.target.value)}
          />
          {aiHelp && (
            <button
              onClick={handleAI}
              disabled={generating}
              className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 transition-colors"
            >
              {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {generating ? 'Generating...' : 'Improve with AI'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default function ProjectDescription() {
  const { currentProject, setCurrentProject } = useProject();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (currentProject) setForm(currentProject);
  }, [currentProject?.id]);

  const update = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Project.update(currentProject.id, form);
    setCurrentProject({ ...currentProject, ...form });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDownload = () => {
    const { jsPDF } = window.jspdf || {};
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 18;
      const maxW = pageW - margin * 2;
      let y = 24;

      const addText = (text, size, bold, color) => {
        doc.setFontSize(size);
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        if (color) doc.setTextColor(...color);
        else doc.setTextColor(30, 30, 30);
        const lines = doc.splitTextToSize(text, maxW);
        lines.forEach(line => {
          if (y > 272) { doc.addPage(); y = 18; }
          doc.text(line, margin, y);
          y += size * 0.45;
        });
        y += 2;
      };

      const sections = [
        { label: 'Project Vision', field: 'description' },
        { label: 'Problem Statement', field: 'problem_statement' },
        { label: 'Target Market', field: 'target_market' },
        { label: 'Customer Persona', field: 'customer_persona' },
        { label: 'Value Proposition', field: 'value_proposition' },
        { label: 'Competitive Landscape', field: 'competitive_landscape' },
        { label: 'Core Product Features', field: 'core_features' },
        { label: 'MVP Scope', field: 'mvp_scope' },
        { label: 'Revenue Model', field: 'revenue_model' },
        { label: 'Success Metrics', field: 'success_metrics' },
      ];

      // Title block
      doc.setFillColor(30, 30, 40);
      doc.rect(0, 0, pageW, 38, 'F');
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(form.name || currentProject.name, margin, 18);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(180, 180, 180);
      doc.text(`Project Brief  ·  Stage: ${currentProject.stage || '—'}  ·  ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 30);
      y = 50;

      sections.forEach(s => {
        addText(s.label, 12, true, [80, 60, 10]);
        addText(form[s.field] || 'Not defined', 10, false, [50, 50, 50]);
        y += 4;
        if (y < 272) {
          doc.setDrawColor(220, 210, 190);
          doc.line(margin, y - 2, pageW - margin, y - 2);
          y += 4;
        }
      });

      doc.save(`${(form.name || currentProject.name).replace(/ /g, '_')}_Project_Brief.pdf`);
    });
  };

  if (!currentProject) {
    return <div className="text-muted-foreground text-sm">No project selected.</div>;
  }

  const sections = [
    { label: 'Project Vision', field: 'description', placeholder: 'Describe the overarching vision for your startup...' },
    { label: 'Problem Statement', field: 'problem_statement', placeholder: 'What problem are you solving? Who experiences this pain?' },
    { label: 'Target Market', field: 'target_market', placeholder: 'Who are your target customers? Market size and segments?' },
    { label: 'Customer Persona', field: 'customer_persona', placeholder: 'Describe your ideal customer in detail...' },
    { label: 'Value Proposition', field: 'value_proposition', placeholder: 'What unique value do you deliver? Why will customers choose you?' },
    { label: 'Competitive Landscape', field: 'competitive_landscape', placeholder: 'Who are your competitors? What is your moat?' },
    { label: 'Core Product Features', field: 'core_features', placeholder: 'List the essential features of your product...' },
    { label: 'MVP Scope', field: 'mvp_scope', placeholder: 'What is included in your minimum viable product?' },
    { label: 'Revenue Model', field: 'revenue_model', placeholder: 'How will you make money? Pricing strategy?' },
    { label: 'Success Metrics', field: 'success_metrics', placeholder: 'How will you measure success? Key KPIs and targets?' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Project Brief</h2>
          <p className="text-muted-foreground text-sm mt-1">Define your startup with clarity and precision</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors text-muted-foreground"
          >
            <Download size={14} /> Download
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-foreground text-background rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saved ? 'Saved!' : 'Save Blueprint'}
          </button>
        </div>
      </div>

      {sections.map(s => (
        <Section
          key={s.field}
          label={s.label}
          field={s.field}
          value={form[s.field]}
          onChange={val => update(s.field, val)}
          placeholder={s.placeholder}
          aiHelp={true}
        />
      ))}
    </div>
  );
}