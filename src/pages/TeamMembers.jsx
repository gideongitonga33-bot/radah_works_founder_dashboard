import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useProject } from '@/lib/ProjectContext';
import { Users, CheckCircle2, Clock, Star, Mail, ExternalLink } from 'lucide-react';

export default function TeamMembers() {
  const { currentProject } = useProject();
  const [roles, setRoles] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentProject?.id) { setLoading(false); return; }
    Promise.all([
      base44.entities.TeamRole.filter({ project_id: currentProject.id }),
      base44.entities.Candidate.filter({ project_id: currentProject.id }),
    ]).then(([r, c]) => { setRoles(r); setCandidates(c); }).finally(() => setLoading(false));
  }, [currentProject?.id]);

  const filledRoles = roles.filter(r => r.status === 'filled');
  const interviewingRoles = roles.filter(r => r.status === 'interviewing');
  const selectedCandidates = candidates.filter(c => c.status === 'selected');

  const totalComp = filledRoles.reduce((s, r) => s + (r.estimated_compensation || 0), 0);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Team Members</h2>
        <p className="text-muted-foreground text-sm mt-1">Active team for {currentProject?.name || 'your project'}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm text-center">
          <div className="text-3xl font-semibold font-sans text-green-600">{filledRoles.length}</div>
          <div className="text-sm text-muted-foreground mt-1">Filled Roles</div>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm text-center">
          <div className="text-3xl font-semibold font-sans text-amber-600">{interviewingRoles.length}</div>
          <div className="text-sm text-muted-foreground mt-1">In Interview</div>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm text-center">
          <div className="text-3xl font-semibold font-sans">${(totalComp / 1000).toFixed(0)}k</div>
          <div className="text-sm text-muted-foreground mt-1">Total Team Comp/yr</div>
        </div>
      </div>

      {/* Active Team */}
      {filledRoles.length > 0 && (
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-serif text-base font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-500" /> Active Team
            </h3>
          </div>
          <div className="divide-y divide-border">
            {filledRoles.map(role => {
              const selected = selectedCandidates.find(c => c.role_id === role.id);
              return (
                <div key={role.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                    {selected ? selected.name[0] : role.title[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground">{selected?.name || 'Role Filled'}</div>
                    <div className="text-xs text-muted-foreground">{role.title}</div>
                    {selected?.skills && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {selected.skills.split(',').slice(0, 3).map((s, i) => (
                          <span key={i} className="text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground">{s.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-medium">${(role.estimated_compensation / 1000).toFixed(0)}k/yr</div>
                    <div className="flex items-center gap-1 mt-1 justify-end">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-xs text-green-600">Active</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interviewing */}
      {interviewingRoles.length > 0 && (
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-serif text-base font-semibold flex items-center gap-2">
              <Clock size={16} className="text-amber-500" /> In Progress
            </h3>
          </div>
          <div className="divide-y divide-border">
            {interviewingRoles.map(role => (
              <div key={role.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-semibold text-sm shrink-0">
                  {role.title[0]}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-foreground">{role.title}</div>
                  <div className="text-xs text-muted-foreground">Interviewing candidates</div>
                </div>
                <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">Interviewing</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {filledRoles.length === 0 && interviewingRoles.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center h-60 bg-white rounded-2xl border border-dashed border-border text-center px-4">
          <Users size={32} className="text-muted-foreground mb-3" />
          <h3 className="font-serif text-lg font-medium mb-1">No team members yet</h3>
          <p className="text-muted-foreground text-sm">Fill roles in Team Architecture or select candidates from the pipeline to build your team.</p>
        </div>
      )}
    </div>
  );
}