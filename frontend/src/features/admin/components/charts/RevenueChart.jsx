import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getChartColors } from './chartTheme';

function RevenueChart({ data }) {
  const { tickFill, gridColor, tooltipBg, tooltipBorder, tooltipText, emptyText } = getChartColors();

  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center text-sm" style={{ color: emptyText }}>
        No revenue data available yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
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
          tick={{ fontSize: 12, fill: tickFill }}
          tickFormatter={(v) => `Rs ${v}`}
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
          formatter={(value) => [`Rs ${Number(value).toFixed(2)}`, 'Revenue']}
          labelFormatter={(v) => {
            const d = new Date(v);
            return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
          }}
        />
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="total"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#revenueGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default RevenueChart;
