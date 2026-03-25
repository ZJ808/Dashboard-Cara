import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Legend, Tooltip,
} from 'recharts';
import { SCORE_DIMENSIONS, dimLabel } from '../../data/scoring';
import { useT } from '../../i18n/LanguageContext';

export default function ScoreRadar({ scenarios, scoreMap }) {
  const { lang, tf } = useT();

  const data = SCORE_DIMENSIONS.map(dim => {
    const entry = { dimension: dimLabel(dim, lang) };
    scenarios.forEach(s => {
      entry[s.id] = scoreMap[s.id]?.[dim.key] ?? 0;
    });
    return entry;
  });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <ResponsiveContainer width="100%" height={340}>
      <RadarChart data={data} margin={{ top: 10, right: 40, bottom: 10, left: 40 }}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fontSize: 11, fill: '#64748b' }}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
          formatter={(value, name) => {
            const s = scenarios.find(sc => sc.id === name);
            const label = typeof s?.name === 'object' ? tf(s.name) : (s?.name ?? name);
            return [`${value} / 5`, label];
          }}
        />
        {scenarios.map((s, i) => (
          <Radar
            key={s.id}
            name={s.id}
            dataKey={s.id}
            stroke={COLORS[i % COLORS.length]}
            fill={COLORS[i % COLORS.length]}
            fillOpacity={0.07}
            strokeWidth={2}
          />
        ))}
        <Legend
          formatter={value => {
            const s = scenarios.find(sc => sc.id === value);
            return typeof s?.name === 'object' ? tf(s.name) : (s?.name ?? value);
          }}
          wrapperStyle={{ fontSize: 12 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
