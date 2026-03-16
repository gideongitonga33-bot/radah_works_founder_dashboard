import { useProject } from '@/lib/ProjectContext';
import { UsersRound } from 'lucide-react';

export default function TeamMembers() {
  const { currentProject } = useProject();
  return (
    <div className="max-w-3xl">
      <h2 className="font-serif text-2xl font-semibold mb-2">Team Members</h2>
      <p className="text-muted-foreground text-sm mb-6">Manage your active team for {currentProject?.name || 'your project'}</p>
      <div className="flex flex-col items-center justify-center h-60 bg-white rounded-2xl border border-dashed border-border text-center px-4">
        <UsersRound size={32} className="text-muted-foreground mb-3" />
        <h3 className="font-serif text-lg font-medium mb-1">Team members coming soon</h3>
        <p className="text-muted-foreground text-sm">Select candidates from the pipeline to build your team roster.</p>
      </div>
    </div>
  );
}