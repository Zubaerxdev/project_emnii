const locale = (lang) => (lang === 'bn' ? 'bn-BD' : 'en-US');

export const num = (n, lang, digits = 1) =>
  new Intl.NumberFormat(locale(lang), { maximumFractionDigits: digits }).format(n);

export const taka = (n, lang, digits = 1) => `৳${num(n, lang, digits)}`;

export function kgLabel(qty, lang) {
  if (qty >= 1000) return `${num(qty / 1000, lang, 1)} ${lang === 'bn' ? 'টন' : 't'}`;
  return `${num(qty, lang, 0)} ${lang === 'bn' ? 'কেজি' : 'kg'}`;
}

export function co2Label(kg, lang) {
  if (kg >= 1000) return `${num(kg / 1000, lang, 1)} ${lang === 'bn' ? 'টন' : 't'}`;
  return `${num(kg, lang, 0)} ${lang === 'bn' ? 'কেজি' : 'kg'}`;
}

export function ago(ts, lang) {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 10) return lang === 'bn' ? 'এইমাত্র' : 'just now';
  if (s < 60) return lang === 'bn' ? `${num(s, lang, 0)} সেকেন্ড আগে` : `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return lang === 'bn' ? `${num(m, lang, 0)} মিনিট আগে` : `${m} min ago`;
  const h = Math.round(m / 60);
  return lang === 'bn' ? `${num(h, lang, 0)} ঘণ্টা আগে` : `${h} h ago`;
}
