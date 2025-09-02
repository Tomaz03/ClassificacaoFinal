import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function BarChartComponent({ correct, total }) {
  const incorrect = total - correct;

  const data = [
    { name: 'Acertos', value: correct, color: '#22c55e' },
    { name: 'Erros', value: incorrect, color: '#ef4444' },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white shadow rounded px-2 py-1 text-sm border border-gray-200">
          <span className="font-medium text-gray-800">{item.name}: {item.value}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}


