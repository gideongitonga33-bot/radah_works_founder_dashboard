import { cn } from '@/lib/utils';

const statusColors = {
  open: { bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-400', text: 'text-amber-700' },
  interviewing: { bg: 'bg-blue-50 border-blue-200', dot: 'bg-blue-400', text: 'text-blue-700' },
  filled: { bg: 'bg-green-50 border-green-200', dot: 'bg-green-500', text: 'text-green-700' },
};

const priorityRing = {
  critical: 'ring-2 ring-red-400 ring-offset-2',
  high: 'ring-2 ring-amber-400 ring-offset-2',
  medium: '',
  low: '',
};

export default function TeamMap({ roles }) {
  if (!roles || roles.length === 0) return null;

  // Group: critical first, then by status
  const critical = roles.filter(r => r.priority === 'critical');
  const high = roles.filter(r => r.priority === 'high');
  const rest = roles.filter(r => r.priority !== 'critical' && r.priority !== 'high');

  const RoleNode = ({ role }) => {
    const sc = statusColors[role.status] || statusColors.open;
    return (
      <div className={cn(
        'flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center min-w-[100px] max-w-[130px] transition-shadow hover:shadow-md cursor-default',
        sc.bg, priorityRing[role.priority]
      )}>
        <div className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center text-lg shadow-sm">
          {role.status === 'filled' ? '✅' : role.status === 'interviewing' ? '🔍' : '🔵'}
        </div>
        <div className="text-xs font-semibold text-foreground leading-tight">{role.title}</div>
        <div className="flex items-center gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
          <span className={`text-xs capitalize ${sc.text}`}>{role.status}</span>
        </div>
        {role.estimated_compensation && (
          <div className="text-xs text-muted-foreground">${(role.estimated_compensation / 1000).toFixed(0)}k</div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {critical.length > 0 && (
        <div>
          <div className="text-xs font-medium text-red-500 uppercase tracking-widest mb-2 px-1">Critical Roles</div>
          <div className="flex flex-wrap gap-3">
            {critical.map(r => <RoleNode key={r.id} role={r} />)}
          </div>
        </div>
      )}
      {high.length > 0 && (
        <div>
          <div className="text-xs font-medium text-amber-600 uppercase tracking-widest mb-2 px-1">High Priority</div>
          <div className="flex flex-wrap gap-3">
            {high.map(r => <RoleNode key={r.id} role={r} />)}
          </div>
        </div>
      )}
      {rest.length > 0 && (
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2 px-1">Other Roles</div>
          <div className="flex flex-wrap gap-3">
            {rest.map(r => <RoleNode key={r.id} role={r} />)}
          </div>
        </div>
      )}
    </div>
  );
}