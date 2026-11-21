import { useCallback, useEffect, useState } from 'react';
import { WASTE, wasteById } from '../data/wasteTypes';
import { DISTRICTS } from '../data/districts';
import { BUYERS } from '../data/buyers';
import { NAMES } from '../data/people';

/*
 * সিমুলেটেড বাজার (ডেমো)। আসল সার্ভার/ডেটাবেস যুক্ত করতে হলে এই ফাইলের
 * tick() ও init() বাদ দিয়ে API/Supabase/Firebase থেকে একই আকারের ডেটা দিন।
 * শুধু ব্যবহারকারীর নিজের তালিকা (mine) localStorage-এ থাকে।
 */

const MINE_KEY = 'khamarchakra.mine.v1';
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const r2 = (v) => Math.round(v * 100) / 100;
const pickOne = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function loadMine() {
  try {
    const v = JSON.parse(localStorage.getItem(MINE_KEY));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function makeListing(rnd, ts, prices, status, id) {
  const w = pickOne(rnd, WASTE);
  const [lo, hi] = w.qty;
  const qty = Math.round((lo + rnd() * (hi - lo)) / 10) * 10;
  const district = pickOne(rnd, DISTRICTS);
  const ask = r2(prices[w.id].now * (0.93 + rnd() * 0.14));
  const l = {
    id,
    wasteId: w.id,
    qty,
    districtId: district.id,
    cond: rnd() < 0.6 ? 'dry' : 'wet',
    pickup: rnd() < 0.5,
    seller: { i: Math.floor(rnd() * NAMES.length), cat: w.cat },
    ask,
    ts,
    status: 'open',
    bids: [],
    mine: false,
  };
  if (status === 'sold') {
    const b = pickOne(rnd, BUYERS.filter((x) => x.bids[w.id]));
    l.status = 'sold';
    l.buyerId = b.id;
    l.soldPrice = r2(ask * (0.97 + rnd() * 0.08));
    l.soldTs = ts + 120000;
  }
  return l;
}

function makeBid(rnd, l, prices, ts) {
  const cands = BUYERS.filter((b) => b.bids[l.wasteId] && !l.bids.some((x) => x.buyerId === b.id));
  if (!cands.length) return null;
  const b = pickOne(rnd, cands);
  return { buyerId: b.id, price: r2(prices[l.wasteId].now * b.bids[l.wasteId] * (0.97 + rnd() * 0.06)), ts };
}

function addTally(t, l, price) {
  const w = wasteById(l.wasteId);
  return {
    byWaste: { ...t.byWaste, [l.wasteId]: (t.byWaste[l.wasteId] || 0) + l.qty },
    byDistrict: { ...t.byDistrict, [l.districtId]: (t.byDistrict[l.districtId] || 0) + l.qty },
    income: t.income + l.qty * price,
    deals: t.deals + 1,
    co2: (t.co2 || 0) + l.qty * (w ? w.co2 : 0),
  };
}

function init() {
  const rnd = mulberry32(20261120);
  const now = Date.now();
  const prices = {};
  WASTE.forEach((w) => {
    let f = 1 + (rnd() - 0.5) * 0.16;
    const hist = [];
    for (let i = 0; i < 30; i++) {
      f += (1 - f) * 0.07 + (rnd() - 0.5) * 2 * w.vol;
      f = clamp(f, 0.75, 1.35);
      hist.push(r2(w.base * f));
    }
    prices[w.id] = { now: hist[29], prev: hist[28], hist };
  });

  let seq = 0;
  const listings = [];
  for (let i = 0; i < 18; i++) {
    const status = i < 13 ? 'open' : 'sold';
    const ageMin = status === 'open' ? rnd() * 40 : 12 + rnd() * 40;
    const l = makeListing(rnd, now - ageMin * 60000, prices, status, `S${++seq}`);
    if (status === 'open') {
      const n = Math.floor(rnd() * 3);
      for (let k = 0; k < n; k++) {
        const bid = makeBid(rnd, l, prices, now - rnd() * 20 * 60000);
        if (bid) l.bids.push(bid);
      }
    }
    listings.push(l);
  }

  // ডেমো ভিত্তি-ডেটা (প্রভাব পাতার জন্য)
  const byWaste = {};
  let income = 0;
  let co2 = 0;
  WASTE.forEach((w) => {
    const kg = Math.round((9000 + rnd() * 52000) / 10) * 10;
    byWaste[w.id] = kg;
    income += kg * w.base * 1.06;
    co2 += kg * w.co2;
  });
  const total = Object.values(byWaste).reduce((a, b) => a + b, 0);
  const weights = DISTRICTS.map(() => rnd() + 0.2);
  const wSum = weights.reduce((a, b) => a + b, 0);
  const byDistrict = {};
  DISTRICTS.forEach((d, i) => { byDistrict[d.id] = Math.floor((total * weights[i]) / wSum); });

  let tally = { byWaste, byDistrict, income: Math.round(income), deals: 318, co2 };
  const mine = loadMine();
  mine.forEach((l) => {
    if (l.status === 'sold') tally = addTally(tally, l, l.soldPrice || l.ask);
  });

  return { prices, listings: [...mine, ...listings], events: [], tally, seq, tickNo: 0 };
}

function closeDeal(s, id, buyerId, price) {
  const l = s.listings.find((x) => x.id === id);
  if (!l || l.status !== 'open') return s;
  const now = Date.now();
  const seq = s.seq + 1;
  return {
    ...s,
    seq,
    listings: s.listings.map((x) =>
      x.id === id ? { ...x, status: 'sold', buyerId, soldPrice: r2(price), soldTs: now } : x
    ),
    tally: addTally(s.tally, l, price),
    events: [
      { id: `E${seq}`, type: 'sold', wasteId: l.wasteId, qty: l.qty, districtId: l.districtId, buyerId, ts: now },
      ...s.events,
    ].slice(0, 14),
  };
}

function tick(s) {
  const rnd = Math.random;
  const now = Date.now();
  let seq = s.seq;

  const prices = {};
  WASTE.forEach((w) => {
    const p = s.prices[w.id];
    let f = p.now / w.base;
    f += (1 - f) * 0.06 + (rnd() - 0.5) * 2 * w.vol;
    f = clamp(f, 0.75, 1.35);
    const nowP = r2(w.base * f);
    prices[w.id] = { now: nowP, prev: p.now, hist: [...p.hist.slice(-29), nowP] };
  });

  let listings = s.listings;
  let events = s.events;
  let state = { ...s, prices, tickNo: s.tickNo + 1 };

  // নতুন তালিকা
  if (rnd() < 0.5 && listings.filter((l) => l.status === 'open').length < 26) {
    const l = makeListing(rnd, now, prices, 'open', `L${++seq}`);
    listings = [l, ...listings];
    events = [
      { id: `E${++seq}`, type: 'new', wasteId: l.wasteId, qty: l.qty, districtId: l.districtId, ts: now },
      ...events,
    ];
  }

  // নতুন দর — নিজের খোলা তালিকায় একটু বেশি সম্ভাবনা, যাতে ডেমোতে দ্রুত দর দেখা যায়
  if (rnd() < 0.6) {
    const open = listings.filter((l) => l.status === 'open');
    const mineOpen = open.filter((l) => l.mine);
    const pool = mineOpen.length && rnd() < 0.5 ? mineOpen : open;
    if (pool.length) {
      const l = pickOne(rnd, pool);
      const bid = makeBid(rnd, l, prices, now);
      if (bid) {
        listings = listings.map((x) => (x.id === l.id ? { ...x, bids: [...x.bids, bid] } : x));
        events = [
          { id: `E${++seq}`, type: 'bid', wasteId: l.wasteId, qty: l.qty, districtId: l.districtId, buyerId: bid.buyerId, ts: now },
          ...events,
        ];
      }
    }
  }

  state = { ...state, listings, events: events.slice(0, 14), seq };

  // ডেমো বাজারের (নিজের নয়) কিছু তালিকা বিক্রি হয়ে যায়
  if (rnd() < 0.28) {
    const cands = state.listings.filter((l) => l.status === 'open' && !l.mine && l.bids.length);
    if (cands.length) {
      const l = pickOne(rnd, cands);
      const best = [...l.bids].sort((a, b) => b.price - a.price)[0];
      state = closeDeal(state, l.id, best.buyerId, best.price);
    }
  }

  // তালিকা সীমিত রাখা: পুরনো বিক্রি-হওয়া (নিজের নয়) আগে বাদ
  if (state.listings.length > 42) {
    const sorted = [...state.listings].sort((a, b) => a.ts - b.ts);
    const drop = new Set();
    for (const l of sorted) {
      if (state.listings.length - drop.size <= 42) break;
      if (!l.mine && l.status === 'sold') drop.add(l.id);
    }
    if (drop.size) state = { ...state, listings: state.listings.filter((l) => !drop.has(l.id)) };
  }
  return state;
}

export function useMarket() {
  const [s, setS] = useState(init);

  useEffect(() => {
    const id = setInterval(() => setS(tick), 3500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(MINE_KEY, JSON.stringify(s.listings.filter((l) => l.mine)));
    } catch {
      /* সংরক্ষণ না হলেও অ্যাপ চলবে */
    }
  }, [s.listings]);

  const addListing = useCallback((data) => {
    const id = `M${Date.now().toString(36)}`;
    const now = Date.now();
    setS((prev) => {
      const seq = prev.seq + 1;
      const l = { ...data, id, ts: now, status: 'open', bids: [], mine: true };
      return {
        ...prev,
        seq,
        listings: [l, ...prev.listings],
        events: [
          { id: `E${seq}`, type: 'new', wasteId: l.wasteId, qty: l.qty, districtId: l.districtId, ts: now },
          ...prev.events,
        ].slice(0, 14),
      };
    });
    return id;
  }, []);

  // ক্রেতা চাওয়া-দামে তালিকা নিয়ে নেয়
  const claim = useCallback((listingId, buyerId) => {
    setS((prev) => {
      const l = prev.listings.find((x) => x.id === listingId);
      return l ? closeDeal(prev, listingId, buyerId, l.ask) : prev;
    });
  }, []);

  // খামারি একটি দর গ্রহণ করে
  const acceptBid = useCallback((listingId, buyerId) => {
    setS((prev) => {
      const l = prev.listings.find((x) => x.id === listingId);
      const bid = l && l.bids.find((b) => b.buyerId === buyerId);
      return bid ? closeDeal(prev, listingId, buyerId, bid.price) : prev;
    });
  }, []);

  const clearMine = useCallback(() => {
    setS((prev) => ({ ...prev, listings: prev.listings.filter((l) => !l.mine) }));
  }, []);

  return { ...s, addListing, claim, acceptBid, clearMine };
}
