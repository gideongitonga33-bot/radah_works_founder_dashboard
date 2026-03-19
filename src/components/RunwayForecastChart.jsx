import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingDown } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  return (
    <div className="bg-white border border-border rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold mb-1">{label}</p>
      <p className={`font-medium ${val <= 0 ? 'text-red-600' : val < 5000 ? 'text-amber-600' : 'text-green-600'}`}>
        ${Math.max(0, val).toLocaleString()} remaining
      </p>
    </div>
  );
};

export default function RunwayForecastChart({ monthlyBudget, avgBurnRate, runway }) {
  // Build forecast data: project balance month by month
  const months = Math.max(runway !== null ? runway + 2 : 12, 6);
  const data = Array.from({ length: months + 1 }, (_, i) => {
    const balance = monthlyBudget - avgBurnRate * i;
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    const label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    return { label, balance: Math.max(0, balance), projected: balance };
  });

  const bankruptcyMonth = data.find(d => d.projected <= 0);
  const dangerZoneStart = data.find(d => d.projected <= avgBurnRate * 3);

  const runwayColor = runway === null ? '#6b7280'
    : runway <= 3 ? '#ef4444'
    : runway <= 6 ? '#f59e0b'
    : '#22c55e';

  return (
    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <TrendingDown size={16} className="text-amber-500" />
            <h3 className="font-serif text-base font-semibold">Runway Forecast</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Projected cash balance based on avg burn of ${avgBurnRate.toLocaleString()}/mo
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color: runwayColor }}>
            {runway !== null ? `${runway} mo` : '—'}
          </div>
          <div className="text-xs text-muted-foreground">runway left</div>
        </div>
      </div>

      {runway !== null && runway <= 3 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium mb-4">
          <AlertTriangle size={14} className="shrink-0" />
          Critical: Bankruptcy projected {bankruptcyMonth ? `in ${bankruptcyMonth.label}` : 'soon'}
        </div>
      )}
      {runway !== null && runway > 3 && runway <= 6 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 font-medium mb-4">
          <AlertTriangle size={14} className="shrink-0" />
          Warning: Less than 6 months of runway — consider fundraising or cutting costs
        </div>
      )}

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={runwayColor} stopOpacity={0.25} />
              <stop offset="95%" stopColor={runwayColor} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,10%,92%)" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          {dangerZoneStart && (
            <ReferenceLine
              x={dangerZoneStart.label}
              stroke="#f59e0b"
              strokeDasharray="5 3"
              label={{ value: '⚠ 3 mo', position: 'top', fontSize: 10, fill: '#f59e0b' }}
            />
          )}
          {bankruptcyMonth && (
            <ReferenceLine
              x={bankruptcyMonth.label}
              stroke="#ef4444"
              strokeDasharray="5 3"
              label={{ value: '💀 $0', position: 'top', fontSize: 10, fill: '#ef4444' }}
            />
          )}
          <Area
            type="monotone"
            dataKey="balance"
            name="Projected Balance"
            stroke={runwayColor}
            strokeWidth={2.5}
            fill="url(#balanceGradient)"
            dot={false}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
        <span>Today: <span className="font-semibold text-foreground">${monthlyBudget.toLocaleString()}</span> budget</span>
        <span>Burn rate: <span className="font-semibold text-foreground">${avgBurnRate.toLocaleString()}/mo</span></span>
        {bankruptcyMonth && <span>Zero: <span className="font-semibold text-red-500">{bankruptcyMonth.label}</span></span>}
      </div>
    </div>
  );
}