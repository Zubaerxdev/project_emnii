import { createContext, useContext, useMemo } from 'react';
import { STR } from './i18n';

const Ctx = createContext({ lang: 'bn', t: (k) => k, pick: (o) => o?.bn });

export function LangProvider({ lang, children }) {
  const value = useMemo(
    () => ({
      lang,
      t: (key, vars) => {
        let s = STR[lang][key] ?? STR.bn[key] ?? key;
        if (vars) Object.keys(vars).forEach((k) => { s = s.split(`{${k}}`).join(vars[k]); });
        return s;
      },
      // { bn, en } আকারের অবজেক্ট থেকে বর্তমান ভাষার লেখা
      pick: (o) => (o ? o[lang] ?? o.bn : ''),
    }),
    [lang]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
