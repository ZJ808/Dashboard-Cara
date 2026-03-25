export default function RedFlagBox({ flags }) {
  if (!flags || flags.length === 0) {
    return (
      <span className="text-xs text-slate-400 italic">Aucun signal d'alerte identifié</span>
    );
  }
  return (
    <ul className="space-y-1">
      {flags.map((flag, i) => (
        <li key={i} className="flex items-start gap-1.5 text-xs text-red-700">
          <span className="mt-0.5 shrink-0 text-red-400">▲</span>
          <span>{flag}</span>
        </li>
      ))}
    </ul>
  );
}
