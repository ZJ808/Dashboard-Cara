import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Legend, Tooltip,
} from 'recharts';
import { SCORE_DIMENSIONS } from '../../data/scoring';

export default function ScoreRadar({ scenarios, scoreMap }) {
  // scoreMap: { scenarioId: { dimension: score } }
  const data = SCORE_DIMENSIONS.map(dim => {
    const entry = { dimension: dim.label };
    scenarios.forEach(s => {
      entry[s.id] = scoreMap[s.id]?.[dim.key] ?? 0;
    });
    return entry;
  });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fontSize: 11, fill: '#64748b' }}
        />
        <Tooltip
          formatter={(value, name) => {
            const s = scenarios.find(sc => sc.id === name);
            return [value + ' / 5', s?.name ?? name];
          }}
        />
        {scenarios.map((s, i) => (
          <Radar
            key={s.id}
            name={s.id}
            dataKey={s.id}
            stroke={COLORS[i % COLORS.length]}
            fill={COLORS[i % COLORS.length]}
            fillOpacity={0.08}
            strokeWidth={2}
          />
        ))}
        <Legend
          formatter={(value) => scenarios.find(s => s.id === value)?.name ?? value}
          wrapperStyle={{ fontSize: 12 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
