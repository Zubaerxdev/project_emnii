import { useCallback, useMemo, useState } from 'react';
import { WASTE, wasteById } from '../data/wasteTypes';
import { DISTRICTS, districtById } from '../data/districts';
import { buyerById } from '../data/buyers';
import { matchBuyers, roadKm, transportPerKg } from '../lib/match';
import { kgLabel, taka, num } from '../lib/format';
import { Toast } from '../components/Common';
import { useLang } from '../lang';

const EMPTY = { wasteId: '', qty: '', districtId: '', cond: 'dry', ask: '', pickup: false, name: '', phone: '' };

export default function SellView({ market }) {
  const { t, pick, lang } = useLang();
  const [f, setF] = useState(EMPTY);
  const [errs, setErrs] = useState({});
  const [toast, setToast] = useState('');
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const clearToast = useCallback(() => setToast(''), []);

  const w = f.wasteId ? wasteById(f.wasteId) : null;
  const mkt = w ? market.prices[w.id].now : 0;
  const qtyNum = parseInt(f.qty, 10) || 0;
  const askNum = f.ask.trim() === '' ? mkt : parseFloat(f.ask);

  const matches = useMemo(
    () =>
      w && f.districtId
        ? matchBuyers({ wasteId: w.id, districtId: f.districtId, price: mkt, pickup: f.pickup, qty: qtyNum })
        : [],
    [w, f.districtId, mkt, f.pickup, qtyNum]
  );
  const shownMatches = matches.slice(0, 3);
  const top = matches[0];
  const mine = market.listings.filter((l) => l.mine).sort((a, b) => b.ts - a.ts);

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!w) er.wasteId = t('err_type');
    if (qtyNum < 10) er.qty = t('err_qty');
    if (!f.districtId) er.districtId = t('err_district');
    if (!(askNum > 0)) er.ask = t('err_ask');
    setErrs(er);
    if (Object.keys(er).length) return;
    market.addListing({
      wasteId: w.id,
      qty: qtyNum,
      districtId: f.districtId,
      cond: f.cond,
      ask: Math.round(askNum * 100) / 100,
      pickup: f.pickup,
      seller: { custom: f.name.trim() || t('my_farm') },
      phone: f.phone.trim(),
    });
    setToast(t('sell_done'));
    setF((p) => ({ ...EMPTY, districtId: p.districtId, name: p.name, phone: p.phone }));
  };

  const matchBody = (
    <>
          <h2>{t('match_title')}</h2>
          {shownMatches.length === 0 ? (
            <p className="empty">{w && f.districtId ? t('match_none') : t('match_empty')}</p>
          ) : (
            <>
              <ul className="mlist">
                {shownMatches.map((m) => (
                  <li key={m.buyer.id} className="mrow">
                    <div className="mrow__top">
                      <span className="mrow__name">{pick(m.buyer)}</span>
                      <span className="score" title={t('match_score')}>{num(m.score, lang, 0)}</span>
                    </div>
                    <dl className="nums">
                      <div><dt>{t('match_bid')}</dt><dd>{taka(m.bid, lang, 2)}</dd></div>
                      <div><dt>{t('match_km')}</dt><dd>{num(m.km, lang, 0)} {t('km')}</dd></div>
                      <div><dt>{t('match_transport')}</dt><dd>{m.transport ? `−${taka(m.transport, lang, 2)}` : taka(0, lang, 0)}</dd></div>
                      <div><dt>{t('match_net')}</dt><dd><strong>{taka(m.net, lang, 2)}</strong></dd></div>
                    </dl>
                    {!m.capOk && <p className="warn">{t('cap_low')}</p>}
                  </li>
                ))}
              </ul>
              {qtyNum >= 10 && top && (
                <p className="total">
                  {t('match_total')}: <strong>{taka(top.net * qtyNum, lang, 0)}</strong>
                </p>
              )}
              {top && askNum > top.bid * 1.02 && <p className="warn">{t('ask_above')}</p>}
              <p className="hint">{t('match_how')}</p>
            </>
          )}
    </>
  );

  return (
    <div className="wrap">
      <header className="pagehead">
        <h1>{t('sell_title')}</h1>
        <p>{t('sell_intro')}</p>
      </header>

      <div className="layout2">
        <form className="form" onSubmit={submit} noValidate>
          <div className="field">
            <span className="field__label" id="type-l">{t('sell_type')}</span>
            <div className="typegrid" role="radiogroup" aria-labelledby="type-l">
              {WASTE.map((x) => (
                <button
                  key={x.id}
                  type="button"
                  role="radio"
                  aria-checked={f.wasteId === x.id}
                  className="typebtn"
                  onClick={() => set('wasteId', x.id)}
                >
                  <span aria-hidden="true">{x.emoji}</span>
                  {pick(x)}
                </button>
              ))}
            </div>
            {errs.wasteId && <p className="err">{errs.wasteId}</p>}
            {w && <p className="hint">{pick(w.tip)}</p>}
          </div>

          <div className="field">
            <label htmlFor="qty">{t('sell_qty')}</label>
            <input
              id="qty"
              className={`input ${errs.qty ? 'has-err' : ''}`}
              inputMode="numeric"
              value={f.qty}
              onChange={(e) => set('qty', e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="1000"
            />
            {errs.qty && <p className="err">{errs.qty}</p>}
          </div>

          <div className="field">
            <label htmlFor="dist">{t('sell_district')}</label>
            <select
              id="dist"
              className={`select ${errs.districtId ? 'has-err' : ''}`}
              value={f.districtId}
              onChange={(e) => set('districtId', e.target.value)}
            >
              <option value="">{t('sell_pick_district')}</option>
              {DISTRICTS.map((d) => (
                <option key={d.id} value={d.id}>{pick(d)}</option>
              ))}
            </select>
            {errs.districtId && <p className="err">{errs.districtId}</p>}
          </div>

          <div className="field">
            <span className="field__label" id="cond-l">{t('sell_cond')}</span>
            <div className="seg" role="radiogroup" aria-labelledby="cond-l">
              {['dry', 'wet'].map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={f.cond === c}
                  className="seg__btn"
                  onClick={() => set('cond', c)}
                >
                  {t(c === 'dry' ? 'cond_dry' : 'cond_wet')}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label htmlFor="ask">{t('sell_ask')}</label>
            <input
              id="ask"
              className={`input ${errs.ask ? 'has-err' : ''}`}
              inputMode="decimal"
              value={f.ask}
              onChange={(e) => set('ask', e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder={w ? String(mkt) : ''}
            />
            {w && <p className="hint">{t('sell_ask_hint', { p: taka(mkt, lang, 2) })}</p>}
            {errs.ask && <p className="err">{errs.ask}</p>}
          </div>

          <label className="check">
            <input type="checkbox" checked={f.pickup} onChange={(e) => set('pickup', e.target.checked)} />
            {t('sell_pickup')}
          </label>

          <div className="field">
            <label htmlFor="name">{t('sell_name')}</label>
            <input id="name" className="input" value={f.name} onChange={(e) => set('name', e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="phone">{t('sell_phone')}</label>
            <input
              id="phone"
              className="input"
              inputMode="tel"
              value={f.phone}
              onChange={(e) => set('phone', e.target.value.replace(/[^0-9+]/g, ''))}
            />
            <p className="hint">{t('phone_note')}</p>
          </div>

          <div className="panel only-narrow" aria-live="polite">
            {matchBody}
          </div>

          <button type="submit" className="btn btn--haldi">{t('sell_submit')}</button>
        </form>

        <aside className="panel panel--sticky only-wide" aria-live="polite">
          {matchBody}
        </aside>
      </div>

      <section className="mineblock" aria-labelledby="mine-h">
        <div className="sectionhead">
          <h2 id="mine-h">{t('mine_title')}</h2>
          {mine.length > 0 && (
            <button
              type="button"
              className="btn btn--small"
              onClick={() => { if (window.confirm(t('clear_confirm'))) market.clearMine(); }}
            >
              {t('clear_mine')}
            </button>
          )}
        </div>
        {mine.length === 0 ? (
          <p className="empty">{t('mine_empty')}</p>
        ) : (
          <div className="mine">
            {mine.map((l) => {
              const lw = wasteById(l.wasteId);
              const bids = [...l.bids].sort((a, b) => b.price - a.price);
              return (
                <article key={l.id} className="mcard">
                  <h3>
                    <span aria-hidden="true">{lw.emoji}</span> {pick(lw)} — {kgLabel(l.qty, lang)}
                  </h3>
                  <p className="hint">
                    {pick(districtById(l.districtId))} · {t('sell_ask')}: {taka(l.ask, lang, 2)}
                  </p>
                  {l.status === 'sold' ? (
                    <p className="soldline">
                      {t('sold_to', { b: pick(buyerById(l.buyerId)) })} — {taka((l.soldPrice || l.ask) * l.qty, lang, 0)}
                    </p>
                  ) : bids.length === 0 ? (
                    <p className="hint">{t('waiting')}</p>
                  ) : (
                    bids.map((b) => {
                      const buyer = buyerById(b.buyerId);
                      const tr = l.pickup ? 0 : transportPerKg(roadKm(l.districtId, buyer.district));
                      return (
                        <div key={b.buyerId} className="bidrow">
                          <span>
                            <strong>{pick(buyer)}</strong> — {taka(b.price, lang, 2)}
                            <span className="hint"> ({t('match_net')} {taka(b.price - tr, lang, 2)})</span>
                          </span>
                          <button
                            type="button"
                            className="btn btn--boro btn--small"
                            onClick={() => market.acceptBid(l.id, b.buyerId)}
                          >
                            {t('accept')}
                          </button>
                        </div>
                      );
                    })
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <Toast msg={toast} onDone={clearToast} />
    </div>
  );
}
