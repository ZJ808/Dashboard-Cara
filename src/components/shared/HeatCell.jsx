import { getScoreBg } from '../../data/scoring';

export default function HeatCell({ score, label }) {
  const bg = getScoreBg(score);
  return (
    <div
      className="flex flex-col items-center justify-center rounded px-2 py-1.5 min-w-[64px]"
      style={{ backgroundColor: bg + '22', border: `1px solid ${bg}44` }}
    >
      <span className="text-xs font-bold" style={{ color: bg }}>{score}/5</span>
      {label && <span className="text-[10px] text-slate-500 mt-0.5 text-center leading-tight">{label}</span>}
    </div>
  );
}
