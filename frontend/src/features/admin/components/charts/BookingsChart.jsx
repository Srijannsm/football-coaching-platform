import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getChartColors } from './chartTheme';

function BookingsChart({ data }) {
  const { tickFill, gridColor, tooltipBg, tooltipBorder, tooltipText, emptyText } = getChartColors();

  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center text-sm" style={{ color: emptyText }}>
        No booking data available yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
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
          allowDecimals={false}
          tick={{ fontSize: 12, fill: tickFill }}
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
          formatter={(value) => [value, 'Bookings']}
          labelFormatter={(v) => {
            const d = new Date(v);
            return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
          }}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default BookingsChart;
