import { useState } from 'react';
import { WASTE, wasteById } from '../data/wasteTypes';
import { BUYERS } from '../data/buyers';
import { districtById } from '../data/districts';
import { taka, num, co2Label } from '../lib/format';
import { useLang } from '../lang';

export default function ValueView({ market }) {
  const { t, pick, lang } = useLang();
  const [wid, setWid] = useState('dung');
  const [qtyStr, setQtyStr] = useState('1000');

  const w = wasteById(wid);
  const qty = Math.min(1000000, Math.max(0, parseInt(qtyStr, 10) || 0));
  const mk = market.prices[wid].now;
  const raw = qty * mk;

  const rows = w.products.map((p) => {
    const outQty = qty * p.out;
    const value = outQty * p.price;
    return { p, outQty, value, mult: raw > 0 ? value / raw : 0 };
  });
  const maxV = Math.max(raw, ...rows.map((r) => r.value), 1);

  return (
    <div className="wrap">
      <header className="pagehead">
        <h1>{t('value_title')}</h1>
        <p>{t('value_intro')}</p>
      </header>

      <div className="layout2 layout2--value">
        <div>
          <div className="field">
            <span className="field__label" id="vt-l">{t('value_pick')}</span>
            <div className="typegrid" role="radiogroup" aria-labelledby="vt-l">
              {WASTE.map((x) => (
                <button
                  key={x.id}
                  type="button"
                  role="radio"
                  aria-checked={wid === x.id}
                  className="typebtn"
                  onClick={() => setWid(x.id)}
                >
                  <span aria-hidden="true">{x.emoji}</span>
                  {pick(x)}
                </button>
              ))}
            </div>
          </div>

          <div className="field qtyfield">
            <label htmlFor="vqty">{t('value_qty')}</label>
            <input
              id="vqty"
              className="input"
              inputMode="numeric"
              value={qtyStr}
              onChange={(e) => setQtyStr(e.target.value.replace(/[^0-9]/g, ''))}
            />
            <div className="chips">
              {[100, 1000, 5000, 20000].map((q) => (
                <button key={q} type="button" className="btn btn--small" onClick={() => setQtyStr(String(q))}>
                  {num(q, lang, 0)}
                </button>
              ))}
            </div>
          </div>

          <p className="callout">
            <strong>{t('tip_title')}:</strong> {pick(w.tip)}
          </p>
        </div>

        <div className="panel">
          <h2>
            {pick(w)} — {num(qty, lang, 0)} {t('kg')}
          </h2>
          <p className="hint">{t('market_now')}: {taka(mk, lang, 2)} {t('per_kg')}</p>

          <div className="vbars">
            <div className="vbar vbar--raw">
              <div className="vbar__label">
                <span>{t('raw_sale')}</span>
                <span>{taka(raw, lang, 0)}</span>
              </div>
              <div className="vbar__track">
                <div className="vbar__fill" style={{ width: `${(raw / maxV) * 100}%` }} />
              </div>
            </div>

            {rows.map(({ p, outQty, value, mult }) => {
              const makers = BUYERS.filter((b) => b.bids[wid] && b.kinds.includes(p.kind));
              return (
                <div key={p.id} className="vbar">
                  <div className="vbar__label">
                    <span>{pick(p)}</span>
                    <span>{taka(value, lang, 0)}</span>
                  </div>
                  <div className="vbar__track">
                    <div className="vbar__fill" style={{ width: `${(value / maxV) * 100}%` }} />
                  </div>
                  <p className="vmeta">
                    {t('output')}: {num(outQty, lang, outQty < 10 ? 2 : 0)} {pick(p.unit)} ×{' '}
                    {taka(p.price, lang, 0)} ·{' '}
                    {mult >= 1
                      ? t('x_raw', { x: num(mult, lang, 1) })
                      : t('below_raw')}
                  </p>
                  {makers.length > 0 && (
                    <p className="vmeta">
                      {t('buyers_for')}: {makers.map((b) => `${pick(b)} (${pick(districtById(b.district))})`).join(', ')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <p className="vmeta co2">
            {t('co2_saved')}: <strong>{co2Label(qty * w.co2, lang)}</strong> CO₂e
          </p>
          <p className="hint">{t('value_caveat')}</p>
        </div>
      </div>
    </div>
  );
}
