import { BUYERS } from '../data/buyers';
import { districtById } from '../data/districts';
import { haversine } from './geo';

// পরিবহন খরচ: ৳ প্রতি কেজি প্রতি কিমি (≈ ৳৯ প্রতি টন-কিমি) — আনুমানিক, নিজের এলাকার ভাড়া দিয়ে বদলে নিন।
export const TRANSPORT_PER_KG_KM = 0.009;
// সরলরেখার দূরত্বকে সড়কপথের আনুমানিক দূরত্বে রূপান্তর।
export const ROAD_FACTOR = 1.3;

export function roadKm(fromId, toId) {
  const a = districtById(fromId);
  const b = districtById(toId);
  if (!a || !b) return 0;
  return haversine(a, b) * ROAD_FACTOR;
}

export function transportPerKg(km) {
  return km * TRANSPORT_PER_KG_KM;
}

/**
 * একটি তালিকার জন্য ক্রেতাদের সাজানো তালিকা।
 * bid = বাজারদর × ক্রেতার গুণক; net = bid − (পরিবহন, যদি খামারি পাঠায়)।
 * score (০–৯৯) = হাতে পাওয়া দাম (৫৫) + সক্ষমতা (২৫) + কাছে থাকা (২০)।
 */
export function matchBuyers({ wasteId, districtId, price, pickup, qty }) {
  const rows = BUYERS.filter((b) => b.bids[wasteId]).map((b) => {
    const km = roadKm(districtId, b.district);
    const bid = price * b.bids[wasteId];
    const transport = pickup ? 0 : transportPerKg(km);
    const net = bid - transport;
    const capOk = b.capacity >= (qty || 0);
    return { buyer: b, km, bid, transport, net, capOk, score: 0 };
  });
  if (!rows.length) return rows;
  const maxNet = Math.max(...rows.map((r) => r.net), 0.01);
  rows.forEach((r) => {
    const distScore = Math.max(0, 1 - r.km / 450);
    const raw =
      55 * (Math.max(r.net, 0) / maxNet) + 25 * (r.capOk ? 1 : 0.4) + 20 * distScore;
    r.score = Math.max(0, Math.min(99, Math.round(raw)));
  });
  return rows.sort((a, b) => b.score - a.score);
}
