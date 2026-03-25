import { getScoreColor } from '../../data/scoring';

export default function ScoreBadge({ score }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getScoreColor(score)}`}>
      {score}/5
    </span>
  );
}
