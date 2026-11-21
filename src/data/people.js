// ডেমো তালিকার কাল্পনিক বিক্রেতা-নাম (possessive রূপে)।
export const NAMES = [
  { bn: 'আলমের', en: "Alam's" },
  { bn: 'করিমের', en: "Karim's" },
  { bn: 'সালমার', en: "Salma's" },
  { bn: 'নাসিরের', en: "Nasir's" },
  { bn: 'রুবিনার', en: "Rubina's" },
  { bn: 'জাহিদের', en: "Zahid's" },
  { bn: 'মোস্তফার', en: "Mostafa's" },
  { bn: 'শিউলির', en: "Shiuli's" },
  { bn: 'বাবুলের', en: "Babul's" },
  { bn: 'তাহমিনার', en: "Tahmina's" },
  { bn: 'হাসানের', en: "Hasan's" },
  { bn: 'রেহানার', en: "Rehana's" },
];

export const SUFFIX = {
  livestock: { bn: 'খামার', en: 'farm' },
  crop: { bn: 'কৃষিজমি', en: 'fields' },
  aqua: { bn: 'ঘের', en: 'pond' },
  market: { bn: 'আড়ত', en: 'stall' },
};

export function sellerLabel(seller, lang) {
  if (!seller) return '';
  if (seller.custom) return seller.custom;
  const n = NAMES[seller.i % NAMES.length];
  return `${n[lang]} ${SUFFIX[seller.cat][lang]}`;
}
