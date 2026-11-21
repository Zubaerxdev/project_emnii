import { useCallback, useMemo, useState } from 'react';
import { WASTE, wasteById } from '../data/wasteTypes';
import { districtById } from '../data/districts';
import { BUYERS, buyerById } from '../data/buyers';
import { sellerLabel } from '../data/people';
import { roadKm, transportPerKg } from '../lib/match';
import { kgLabel, taka, num } from '../lib/format';
import { Toast } from '../components/Common';
import { useLang } from '../lang';

export default function BuyView({ market }) {
  const { t, pick, lang } = useLang();
  const [buyerId, setBuyerId] = useState(BUYERS[0].id);
  const [type, setType] = useState('');
  const [maxKm, setMaxKm] = useState(600);
  const [minQty, setMinQty] = useState(0);
  const [toast, setToast] = useState('');
  const clearToast = useCallback(() => setToast(''), []);

  const b = buyerById(buyerId);
  const accepted = WASTE.filter((w) => b.bids[w.id]);

  const rows = useMemo(() => {
    return market.listings
      .filter((l) => l.status === 'open' && b.bids[l.wasteId] && (!type || l.wasteId === type) && l.qty >= minQty)
      .map((l) => {
        const km = roadKm(l.districtId, b.district);
        const tr = transportPerKg(km);
        const mk = market.prices[l.wasteId].now;
        const landed = l.pickup ? l.ask + tr : l.ask;
        return { l, km, landed, mk, below: l.ask < mk * 0.97, over: l.qty > b.capacity };
      })
      .filter((r) => r.km <= maxKm)
      .sort((x, y) => x.landed / x.mk - y.landed / y.mk);
  }, [market.listings, market.prices, b, type, minQty, maxKm]);

  const claim = (r) => {
    market.claim(r.l.id, b.id);
    setToast(t('buy_claimed', { item: `${pick(wasteById(r.l.wasteId))} ${kgLabel(r.l.qty, lang)}` }));
  };

  return (
    <div className="wrap">
      <header className="pagehead">
        <h1>{t('buy_title')}</h1>
        <p>{t('buy_intro')}</p>
      </header>

      <div className="filters">
        <div className="field">
          <label htmlFor="buyer">{t('buy_as')}</label>
          <select
            id="buyer"
            className="select"
            value={buyerId}
            onChange={(e) => { setBuyerId(e.target.value); setType(''); }}
          >
            {BUYERS.map((x) => (
              <option key={x.id} value={x.id}>{pick(x)} — {pick(districtById(x.district))}</option>
            ))}
          </select>
          <p className="hint">
            {t('buy_capacity')}: {kgLabel(b.capacity, lang)}
          </p>
        </div>
        <div className="field">
          <label htmlFor="btype">{t('buy_filter_type')}</label>
          <select id="btype" className="select" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">{t('all_types')}</option>
            {accepted.map((w) => (
              <option key={w.id} value={w.id}>{pick(w)}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="maxkm">
            {t('buy_max_km')}: {num(maxKm, lang, 0)}
          </label>
          <input
            id="maxkm"
            type="range"
            min="50"
            max="600"
            step="50"
            value={maxKm}
            onChange={(e) => setMaxKm(Number(e.target.value))}
          />
        </div>
        <div className="field">
          <label htmlFor="minq">{t('buy_min_qty')}</label>
          <select id="minq" className="select" value={minQty} onChange={(e) => setMinQty(Number(e.target.value))}>
            {[0, 100, 500, 1000, 2000].map((q) => (
              <option key={q} value={q}>{q === 0 ? t('any') : `${num(q, lang, 0)}+`}</option>
            ))}
          </select>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="empty">{t('buy_none')}</p>
      ) : (
        <div className="tablewrap">
          <table className="ledger">
            <thead>
              <tr>
                <th scope="col">{t('col_item')}</th>
                <th scope="col">{t('col_qty')}</th>
                <th scope="col">{t('col_from')}</th>
                <th scope="col">{t('col_km')}</th>
                <th scope="col">{t('col_ask')}</th>
                <th scope="col">{t('col_landed')}</th>
                <th scope="col"><span className="sr">{t('buy_claim')}</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const w = wasteById(r.l.wasteId);
                return (
                  <tr key={r.l.id}>
                    <td data-label={t('col_item')}>
                      <span aria-hidden="true">{w.emoji}</span> <strong>{pick(w)}</strong>
                      {r.below && <span className="tag tag--good">{t('below_market')}</span>}
                      {r.over && <span className="tag tag--warn">{t('over_cap')}</span>}
                    </td>
                    <td data-label={t('col_qty')}>{kgLabel(r.l.qty, lang)}</td>
                    <td data-label={t('col_from')}>
                      {pick(districtById(r.l.districtId))}
                      <span className="hint block">{sellerLabel(r.l.seller, lang)}</span>
                    </td>
                    <td data-label={t('col_km')}>{num(r.km, lang, 0)} {t('km')}</td>
                    <td data-label={t('col_ask')}>{taka(r.l.ask, lang, 2)}</td>
                    <td data-label={t('col_landed')}>
                      <strong>{taka(r.landed, lang, 2)}</strong>
                      <span className="hint block">{r.l.pickup ? t('landed_with') : t('landed_without')}</span>
                    </td>
                    <td>
                      <button type="button" className="btn btn--boro btn--small" onClick={() => claim(r)}>
                        {t('buy_claim')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Toast msg={toast} onDone={clearToast} />
    </div>
  );
}
