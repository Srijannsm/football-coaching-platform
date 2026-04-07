import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { getChartColors } from './chartTheme';

function UtilizationChart({ data }) {
  const { tickFill, gridColor, tooltipBg, tooltipBorder, tooltipText, emptyText } = getChartColors();

  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center text-sm" style={{ color: emptyText }}>
        No session data available yet.
      </div>
    );
  }

  function getBarColor(utilization) {
    if (utilization >= 0.7) return '#10b981';
    if (utilization >= 0.4) return '#f59e0b';
    return '#ef4444';
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 12, fill: tickFill }}
          tickFormatter={(v) => {
            const d = new Date(v);
            return `${d.getDate()}/${d.getMonth() + 1}`;
          }}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: tickFill }}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: tooltipBg,
            border: `1px solid ${tooltipBorder}`,
            borderRadius: '8px',
            fontSize: '13px',
            color: tooltipText,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
          labelStyle={{ color: tooltipText }}
          itemStyle={{ color: tooltipText }}
          formatter={(value) => [`${value}%`, 'Avg Utilization']}
          labelFormatter={(v) => {
            const d = new Date(v);
            return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
          }}
        />
        <Bar dataKey="avg_utilization" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={getBarColor(entry.avg_utilization)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default UtilizationChart;
