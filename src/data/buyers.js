// সব ক্রেতা কাল্পনিক (ডেমো)। bids = কোন বর্জ্য কেনে এবং বাজারদরের কত গুণ দেয়। capacity = দৈনিক কেজি।
export const BUYERS = [
  { id: 'padma-bio', bn: 'পদ্মা বায়োএনার্জি', en: 'Padma BioEnergy', district: 'gazipur', kinds: ['biogas'], capacity: 12000,
    bids: { dung: 1.15, litter: 1.1, veg: 1.2, hyacinth: 1.1 } },
  { id: 'meghna-compost', bn: 'মেঘনা জৈব সার', en: 'Meghna Organic Fertiliser', district: 'narayanganj', kinds: ['compost'], capacity: 20000,
    bids: { dung: 1.1, litter: 1.2, hyacinth: 1.15, veg: 1.1, banana: 1.1, fish: 1.0 } },
  { id: 'sundarban-coir', bn: 'সুন্দরবন কয়ার শিল্প', en: 'Sundarban Coir Works', district: 'khulna', kinds: ['coir'], capacity: 8000,
    bids: { coco: 1.2, banana: 1.0 } },
  { id: 'jamuna-briquette', bn: 'যমুনা ব্রিকেট', en: 'Jamuna Briquettes', district: 'bogura', kinds: ['briquette'], capacity: 25000,
    bids: { ricehusk: 1.15, bagasse: 1.1, straw: 1.0, jute: 1.05 } },
  { id: 'karnaphuli-chitin', bn: 'কর্ণফুলী কাইটিন ল্যাব', en: 'Karnaphuli Chitin Lab', district: 'chattogram', kinds: ['chitosan', 'fishmeal'], capacity: 3000,
    bids: { shrimp: 1.2, fish: 1.05 } },
  { id: 'tista-mushroom', bn: 'তিস্তা মাশরুম ও ফিড', en: 'Tista Mushroom & Feed', district: 'rangpur', kinds: ['mushroom', 'feed'], capacity: 10000,
    bids: { straw: 1.2, veg: 1.0 } },
  { id: 'jute-carbon', bn: 'পাটকাঠি কার্বন', en: 'Jute Carbon', district: 'faridpur', kinds: ['charcoal'], capacity: 6000,
    bids: { jute: 1.25 } },
  { id: 'coastal-fishmeal', bn: 'উপকূল ফিশমিল', en: 'Coastal Fishmeal', district: 'coxsbazar', kinds: ['fishmeal'], capacity: 5000,
    bids: { fish: 1.15, shrimp: 1.1 } },
  { id: 'barind-biochar', bn: 'বরেন্দ্র বায়োচার', en: 'Barind Biochar', district: 'rajshahi', kinds: ['biochar', 'compost'], capacity: 9000,
    bids: { ricehusk: 1.2, straw: 1.1, jute: 1.0, banana: 1.05, dung: 1.0 } },
  { id: 'natore-pack', bn: 'নাটোর গ্রিন প্যাকেজিং', en: 'Natore Green Packaging', district: 'natore', kinds: ['packaging'], capacity: 15000,
    bids: { bagasse: 1.25 } },
  { id: 'dhaka-calcium', bn: 'ঢাকা ক্যালসিয়াম', en: 'Dhaka Calcium', district: 'dhaka', kinds: ['calcium'], capacity: 800,
    bids: { egg: 1.3 } },
  { id: 'sylhet-nursery', bn: 'সিলেট নার্সারি সাপ্লাই', en: 'Sylhet Nursery Supply', district: 'sylhet', kinds: ['nursery', 'compost'], capacity: 6000,
    bids: { coco: 1.1, dung: 1.05, litter: 1.05 } },
  { id: 'barishal-feed', bn: 'বরিশাল ফিড মিল', en: 'Barishal Feed Mill', district: 'barishal', kinds: ['feed'], capacity: 7000,
    bids: { straw: 1.1, veg: 1.0, fish: 1.0 } },
];

const BY_ID = Object.fromEntries(BUYERS.map((b) => [b.id, b]));
export const buyerById = (id) => BY_ID[id];
