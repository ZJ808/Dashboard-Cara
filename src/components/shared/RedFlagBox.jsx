import { useT } from '../../i18n/LanguageContext';

export default function RedFlagBox({ flags }) {
  const { t, lang } = useT();

  if (!flags || flags.length === 0) {
    return (
      <span className="text-xs text-slate-400 italic">{t('shared.noflags')}</span>
    );
  }

  return (
    <ul className="space-y-1">
      {flags.map((flag, i) => {
        const text = typeof flag === 'object' ? (flag[lang] ?? flag['fr'] ?? '') : flag;
        return (
          <li key={i} className="flex items-start gap-2 text-xs text-red-700">
            <span className="mt-0.5 shrink-0 text-red-400">▲</span>
            <span>{text}</span>
          </li>
        );
      })}
    </ul>
  );
}
