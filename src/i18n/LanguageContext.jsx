import { createContext, useContext, useState } from 'react';
import { translations } from './translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('fr');

  function t(key) {
    return translations[lang]?.[key] ?? translations['fr']?.[key] ?? key;
  }

  // Resolve a bilingual field object { fr, en } or plain string
  function tf(field) {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[lang] ?? field['fr'] ?? '';
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tf }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useT() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useT must be used within LanguageProvider');
  return ctx;
}
