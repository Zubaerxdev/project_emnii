// সব দাম ও রূপান্তর হার আনুমানিক (indicative). আসল ব্যবহারের আগে নিজের এলাকার বাজার ও বিশেষজ্ঞের সঙ্গে মিলিয়ে নিন।
// base = ৳/কেজি, vol = দৈনিক ওঠানামার মাত্রা, co2 = প্রতি কেজি বর্জ্যে আনুমানিক কার্বন সাশ্রয় (কেজি CO2e),
// qty = ডেমো তালিকার সাধারণ পরিমাণ (কেজি), products[].out = প্রতি কেজি বর্জ্যে উৎপাদন, price = প্রতি একক দাম (৳).

export const CATS = {
  livestock: { bn: 'পশুপালন', en: 'Livestock', color: '#B5733A' },
  crop: { bn: 'ফসল', en: 'Crops', color: '#C9A227' },
  aqua: { bn: 'মৎস্য', en: 'Aquaculture', color: '#2D7FA3' },
  market: { bn: 'বাজার ও জলাশয়', en: 'Market & water', color: '#5B9A3C' },
};

export const WASTE = [
  {
    id: 'dung', emoji: '🐄', cat: 'livestock', bn: 'গোবর', en: 'Cow dung',
    base: 2, vol: 0.012, co2: 0.12, qty: [400, 5000],
    products: [
      { id: 'biogas', bn: 'বায়োগ্যাস', en: 'Biogas', out: 0.04, unit: { bn: 'ঘনমিটার', en: 'm³' }, price: 45, kind: 'biogas' },
      { id: 'compost', bn: 'জৈব সার', en: 'Organic fertiliser', out: 0.4, unit: { bn: 'কেজি', en: 'kg' }, price: 12, kind: 'compost' },
    ],
    tip: {
      bn: 'শুকনো বা কাঁচা—ক্রেতার সঙ্গে আগে জেনে নিন কোনটা নেবে। শুকালে ওজন কমে, পরিবহন খরচও কমে।',
      en: 'Dry or fresh — ask the buyer which they take. Drying cuts weight and transport cost.',
    },
  },
  {
    id: 'litter', emoji: '🐔', cat: 'livestock', bn: 'মুরগির লিটার', en: 'Poultry litter',
    base: 7, vol: 0.015, co2: 0.15, qty: [300, 3000],
    products: [
      { id: 'compost', bn: 'জৈব সার', en: 'Organic fertiliser', out: 0.6, unit: { bn: 'কেজি', en: 'kg' }, price: 15, kind: 'compost' },
      { id: 'biogas', bn: 'বায়োগ্যাস', en: 'Biogas', out: 0.07, unit: { bn: 'ঘনমিটার', en: 'm³' }, price: 45, kind: 'biogas' },
    ],
    tip: {
      bn: 'বস্তায় ভরে শুকনো জায়গায় রাখুন; ভিজলে দাম পড়ে যায়।',
      en: 'Bag it and keep it dry; wet litter fetches less.',
    },
  },
  {
    id: 'coco', emoji: '🥥', cat: 'crop', bn: 'নারকেলের খোসা', en: 'Coconut husk',
    base: 4, vol: 0.014, co2: 0.1, qty: [200, 2000],
    products: [
      { id: 'fibre', bn: 'কয়ার ফাইবার (দড়ি, ম্যাট)', en: 'Coir fibre (rope, mats)', out: 0.25, unit: { bn: 'কেজি', en: 'kg' }, price: 40, kind: 'coir' },
      { id: 'cocopeat', bn: 'কোকোপিট (নার্সারির মাটি)', en: 'Cocopeat (nursery medium)', out: 0.65, unit: { bn: 'কেজি', en: 'kg' }, price: 15, kind: 'nursery' },
    ],
    tip: {
      bn: 'খোসা স্তূপ করে রাখলে একসাথে বেশি পরিমাণ পাঠানো সহজ হয়।',
      en: 'Stack husks in bulk — larger loads are cheaper to move.',
    },
  },
  {
    id: 'ricehusk', emoji: '🌾', cat: 'crop', bn: 'ধানের তুষ', en: 'Rice husk',
    base: 3, vol: 0.013, co2: 0.1, qty: [500, 6000],
    products: [
      { id: 'briquette', bn: 'জ্বালানি ব্রিকেট', en: 'Fuel briquettes', out: 0.85, unit: { bn: 'কেজি', en: 'kg' }, price: 8, kind: 'briquette' },
      { id: 'biochar', bn: 'বায়োচার (মাটির উন্নতি)', en: 'Biochar (soil booster)', out: 0.25, unit: { bn: 'কেজি', en: 'kg' }, price: 20, kind: 'biochar' },
    ],
    tip: {
      bn: 'তুষ বাতাসে উড়ে যায়; বস্তাবন্দি করলে ক্ষতি কমে।',
      en: 'Husk blows away; bagging reduces loss.',
    },
  },
  {
    id: 'straw', emoji: '🌿', cat: 'crop', bn: 'ধানের খড়', en: 'Rice straw',
    base: 4, vol: 0.016, co2: 0.2, qty: [500, 8000],
    products: [
      { id: 'mushroom', bn: 'মাশরুম চাষের মাধ্যম', en: 'Mushroom growing substrate', out: 0.9, unit: { bn: 'কেজি', en: 'kg' }, price: 7, kind: 'mushroom' },
      { id: 'feed', bn: 'প্রক্রিয়াজাত পশুখাদ্য', en: 'Treated cattle feed', out: 0.9, unit: { bn: 'কেজি', en: 'kg' }, price: 9, kind: 'feed' },
      { id: 'biochar', bn: 'বায়োচার', en: 'Biochar', out: 0.25, unit: { bn: 'কেজি', en: 'kg' }, price: 25, kind: 'biochar' },
    ],
    tip: {
      bn: 'মাঠে পুড়িয়ে না ফেলে আঁটি করে রাখুন—মাশরুম ও পশুখাদ্যে চাহিদা আছে।',
      en: 'Bale it instead of burning in the field — mushroom growers and feed makers want it.',
    },
  },
  {
    id: 'jute', emoji: '🪵', cat: 'crop', bn: 'পাটকাঠি', en: 'Jute sticks',
    base: 10, vol: 0.012, co2: 0.1, qty: [300, 3000],
    products: [
      { id: 'charcoal', bn: 'পাটকাঠির কাঠকয়লা', en: 'Jute-stick charcoal', out: 0.25, unit: { bn: 'কেজি', en: 'kg' }, price: 60, kind: 'charcoal' },
      { id: 'pellet', bn: 'জ্বালানি পেলেট', en: 'Fuel pellets', out: 0.9, unit: { bn: 'কেজি', en: 'kg' }, price: 11, kind: 'briquette' },
    ],
    tip: {
      bn: 'বান্ডিল বেঁধে শুকিয়ে রাখুন; ভেজা পাটকাঠিতে ছাতা পড়ে।',
      en: 'Bundle and dry it; damp sticks go mouldy.',
    },
  },
  {
    id: 'bagasse', emoji: '🎋', cat: 'crop', bn: 'আখের ছোবড়া', en: 'Sugarcane bagasse',
    base: 2.5, vol: 0.012, co2: 0.1, qty: [1000, 10000],
    products: [
      { id: 'pellet', bn: 'বয়লারের জ্বালানি', en: 'Boiler fuel', out: 0.9, unit: { bn: 'কেজি', en: 'kg' }, price: 6, kind: 'briquette' },
      { id: 'pack', bn: 'মোল্ডেড প্যাকেজিং (থালা, বাক্স)', en: 'Moulded packaging (plates, boxes)', out: 0.6, unit: { bn: 'কেজি', en: 'kg' }, price: 22, kind: 'packaging' },
    ],
    tip: {
      bn: 'মিল থেকে সরাসরি বড় পরিমাণে বিক্রিই সাধারণত লাভজনক।',
      en: 'Direct bulk sales from the mill usually pay best.',
    },
  },
  {
    id: 'shrimp', emoji: '🦐', cat: 'aqua', bn: 'চিংড়ির খোসা-মাথা', en: 'Shrimp shells & heads',
    base: 15, vol: 0.02, co2: 0.25, qty: [100, 1200],
    products: [
      { id: 'chitosan', bn: 'কাইটোসান (শিল্পের কাঁচামাল)', en: 'Chitosan (industrial input)', out: 0.05, unit: { bn: 'কেজি', en: 'kg' }, price: 300, kind: 'chitosan' },
      { id: 'meal', bn: 'চিংড়ির মিল (পশু ও মাছের খাদ্য)', en: 'Shrimp meal (animal & fish feed)', out: 0.3, unit: { bn: 'কেজি', en: 'kg' }, price: 50, kind: 'fishmeal' },
    ],
    tip: {
      bn: 'খোসা-মাথা দ্রুত পচে যায়; বরফ দিন বা শুকিয়ে রাখুন, দ্রুত পাঠান।',
      en: 'Shells spoil fast; ice or dry them and ship quickly.',
    },
  },
  {
    id: 'fish', emoji: '🐟', cat: 'aqua', bn: 'মাছের উচ্ছিষ্ট', en: 'Fish scraps',
    base: 8, vol: 0.018, co2: 0.3, qty: [100, 800],
    products: [
      { id: 'meal', bn: 'ফিশমিল', en: 'Fish meal', out: 0.2, unit: { bn: 'কেজি', en: 'kg' }, price: 60, kind: 'fishmeal' },
      { id: 'fert', bn: 'তরল মাছের সার', en: 'Liquid fish fertiliser', out: 0.7, unit: { bn: 'কেজি', en: 'kg' }, price: 18, kind: 'compost' },
    ],
    tip: {
      bn: 'কাঁচা উচ্ছিষ্ট ২৪ ঘণ্টার মধ্যে পাঠানোই ভালো।',
      en: 'Ship raw scraps within 24 hours.',
    },
  },
  {
    id: 'hyacinth', emoji: '🌱', cat: 'market', bn: 'কচুরিপানা', en: 'Water hyacinth',
    base: 1, vol: 0.02, co2: 0.08, qty: [500, 4000],
    products: [
      { id: 'compost', bn: 'কম্পোস্ট সার', en: 'Compost', out: 0.15, unit: { bn: 'কেজি', en: 'kg' }, price: 14, kind: 'compost' },
      { id: 'biogas', bn: 'বায়োগ্যাস', en: 'Biogas', out: 0.03, unit: { bn: 'ঘনমিটার', en: 'm³' }, price: 45, kind: 'biogas' },
    ],
    tip: {
      bn: 'পানি ঝরিয়ে নিলে ওজন কমে, পরিবহন সস্তা হয়।',
      en: 'Drain the water off — it cuts weight and transport cost.',
    },
  },
  {
    id: 'banana', emoji: '🍌', cat: 'crop', bn: 'কলাগাছের কাণ্ড', en: 'Banana stems',
    base: 1.5, vol: 0.014, co2: 0.06, qty: [300, 2500],
    products: [
      { id: 'compost', bn: 'কম্পোস্ট সার', en: 'Compost', out: 0.2, unit: { bn: 'কেজি', en: 'kg' }, price: 14, kind: 'compost' },
      { id: 'fibre', bn: 'কলার আঁশ', en: 'Banana fibre', out: 0.02, unit: { bn: 'কেজি', en: 'kg' }, price: 120, kind: 'coir' },
    ],
    tip: {
      bn: 'কেটে টুকরো করে রাখলে প্রক্রিয়া সহজ হয়।',
      en: 'Cut into pieces before shipping; easier to process.',
    },
  },
  {
    id: 'egg', emoji: '🥚', cat: 'livestock', bn: 'ডিমের খোসা', en: 'Eggshells',
    base: 9, vol: 0.015, co2: 0.02, qty: [50, 400],
    products: [
      { id: 'calcium', bn: 'ক্যালসিয়াম গুঁড়া (খাদ্য, সার)', en: 'Calcium powder (feed, soil)', out: 0.9, unit: { bn: 'কেজি', en: 'kg' }, price: 14, kind: 'calcium' },
    ],
    tip: {
      bn: 'ধুয়ে শুকিয়ে রাখুন; অল্প পরিমাণেও ক্রেতা আছে।',
      en: 'Rinse and dry; small lots still find buyers.',
    },
  },
  {
    id: 'veg', emoji: '🥬', cat: 'market', bn: 'সবজির বর্জ্য', en: 'Vegetable waste',
    base: 1.2, vol: 0.02, co2: 0.25, qty: [300, 3000],
    products: [
      { id: 'compost', bn: 'কম্পোস্ট সার', en: 'Compost', out: 0.3, unit: { bn: 'কেজি', en: 'kg' }, price: 12, kind: 'compost' },
      { id: 'biogas', bn: 'বায়োগ্যাস', en: 'Biogas', out: 0.06, unit: { bn: 'ঘনমিটার', en: 'm³' }, price: 45, kind: 'biogas' },
    ],
    tip: {
      bn: 'বাজার থেকে সকালেই তুলুন—দুপুরের মধ্যে পচন শুরু হয়।',
      en: 'Collect early; spoilage starts by midday.',
    },
  },
];

const BY_ID = Object.fromEntries(WASTE.map((w) => [w.id, w]));
export const wasteById = (id) => BY_ID[id];
