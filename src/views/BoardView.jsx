import { useMemo, useState } from 'react';
import { WASTE, wasteById } from '../data/wasteTypes';
import { districtById } from '../data/districts';
import { buyerById } from '../data/buyers';
import { sellerLabel } from '../data/people';
import { matchBuyers } from '../lib/match';
import { kgLabel, taka, num, ago } from '../lib/format';
import { Sparkline } from '../components/Common';
import MapView from '../components/MapView';
import { useLang } from '../lang';

const SPARK = { up: '#7FD6A0', down: '#FF9A8B', flat: '#A3BDAE' };

function Board({ prices, selected, onSelect }) {
  const { t, pick, lang } = useLang();
  return (
    <div className="board" role="region" aria-label={t('board_title')}>
      <div className="board__head">
        <h2 className="board__title">{t('board_title')}</h2>
        <span className="live">
          <i className="live__dot" aria-hidden="true" />
          {t('board_live')}
        </span>
      </div>
      <ul className="board__rows">
        {WASTE.map((w) => {
          const p = prices[w.id];
          const diff = p.now - p.prev;
          const pct = p.prev ? (diff / p.prev) * 100 : 0;
          const dir = diff > 0.004 ? 'up' : diff < -0.004 ? 'down' : 'flat';
          const arrow = dir === 'up' ? '▲' : dir === 'down' ? '▼' : '–';
          const on = selected === w.id;
          return (
            <li key={w.id}>
              <button
                type="button"
                className={`brow ${on ? 'is-on' : ''}`}
                aria-pressed={on}
                onClick={() => onSelect(on ? null : w.id)}
              >
                <span className="brow__name">
                  <span aria-hidden="true">{w.emoji}</span>
                  {pick(w)}
                </span>
                <Sparkline data={p.hist} color={SPARK[dir]} />
                <span className="brow__price">
                  <span key={p.now} className="brow__val flash">
                    {taka(p.now, lang, 2)}
                  </span>
                  <span className={`brow__chg chg--${dir}`}>
                    {arrow} {num(Math.abs(pct), lang, 1)}%
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="board__foot">
        {t('per_kg')} — {t('board_hint')}
      </p>
    </div>
  );
}

function eventText(e, t, pick, lang) {
  const w = wasteById(e.wasteId);
  const d = districtById(e.districtId);
  const base = `${pick(w)} ${kgLabel(e.qty, lang)} — ${pick(d)}`;
  if (e.type === 'new') return `${t('ev_new')}: ${base}`;
  const b = buyerById(e.buyerId);
  if (e.type === 'bid') return `${t('ev_bid')}: ${pick(b)} → ${base}`;
  return `${t('ev_sold')}: ${base} → ${pick(b)}`;
}

export default function BoardView({ market }) {
  const { t, pick, lang } = useLang();
  const [selected, setSelected] = useState(null);
  const [hlId, setHlId] = useState(null);

  const open = useMemo(
    () => market.listings.filter((l) => l.status === 'open').sort((a, b) => b.ts - a.ts),
    [market.listings]
  );
  const shown = useMemo(() => {
    const pool = market.listings
      .filter((l) => !selected || l.wasteId === selected)
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === 'open' ? -1 : 1;
        return b.ts - a.ts;
      });
    return pool.slice(0, 12);
  }, [market.listings, selected]);

  const hl = open.find((l) => l.id === hlId) || null;
  const matches = useMemo(
    () =>
      hl
        ? matchBuyers({
            wasteId: hl.wasteId,
            districtId: hl.districtId,
            price: market.prices[hl.wasteId].now,
            pickup: hl.pickup,
            qty: hl.qty,
          }).slice(0, 3)
        : [],
    [hl, market.prices]
  );
  const top = matches[0];
  const selectedWaste = selected ? wasteById(selected) : null;

  return (
    <>
      <section className="wrap hero" aria-labelledby="hero-h">
        <div className="hero__copy">
          <h1 id="hero-h">{t('hero_h')}</h1>
          <p>{t('hero_p')}</p>
          <div className="hero__cta">
            <a className="btn btn--haldi" href="#/sell">{t('cta_sell')}</a>
            <a className="btn" href="#/buy">{t('cta_buy')}</a>
          </div>
        </div>
        <Board prices={market.prices} selected={selected} onSelect={setSelected} />
      </section>

      <section className="wrap exchange" aria-labelledby="list-h">
        <div>
          <div className="sectionhead">
            <h2 id="list-h">{t('listings_title')}</h2>
            {selectedWaste && (
              <button type="button" className="btn btn--small" onClick={() => setSelected(null)}>
                {pick(selectedWaste)} ✕ {t('clear_filter')}
              </button>
            )}
          </div>
          {shown.length === 0 ? (
            <p className="empty">{t('no_listings')}</p>
          ) : (
            <ul className="llist">
              {shown.map((l) => {
                const w = wasteById(l.wasteId);
                const best = l.bids.length ? Math.max(...l.bids.map((b) => b.price)) : null;
                return (
                  <li
                    key={l.id}
                    className={`lrow ${l.status === 'sold' ? 'is-sold' : ''} ${hlId === l.id ? 'is-hl' : ''}`}
                  >
                    <button
                      type="button"
                      className="lrow__btn"
                      disabled={l.status === 'sold'}
                      onMouseEnter={() => l.status === 'open' && setHlId(l.id)}
                      onFocus={() => l.status === 'open' && setHlId(l.id)}
                      onClick={() => setHlId(l.id)}
                    >
                      <span className="lrow__icon" aria-hidden="true">{w.emoji}</span>
                      <span className="lrow__main">
                        <span className="lrow__name">
                          {pick(w)} <b>{kgLabel(l.qty, lang)}</b>
                        </span>
                        <span className="lrow__meta">
                          <span>{pick(districtById(l.districtId))}</span>
                          <span>{sellerLabel(l.seller, lang)}</span>
                          <span>{t(l.cond === 'dry' ? 'cond_dry' : 'cond_wet')}</span>
                          {l.pickup && <span>{t('pickup_yes')}</span>}
                        </span>
                      </span>
                      <span className="lrow__side">
                        <span className="lrow__ask">
                          {taka(l.ask, lang, 2)}
                          <small>{t('per_kg')}</small>
                        </span>
                        <span className="lrow__sub">
                          {l.status === 'sold'
                            ? t('status_sold')
                            : best
                              ? `${t('bids_n', { n: num(l.bids.length, lang, 0) })} · ${t('best_bid')} ${taka(best, lang, 2)}`
                              : ago(l.ts, lang)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div>
          <div className="sectionhead">
            <h2>{t('map_title')}</h2>
          </div>
          <MapView
            listings={open}
            selected={selected}
            highlight={hl}
            matches={matches}
            newestId={open[0] ? open[0].id : null}
          />
          {top && (
            <p className="topmatch">
              <strong>{t('top_match')}</strong> {pick(top.buyer)} — {num(top.km, lang, 0)} {t('km')},{' '}
              {t('match_net')} {taka(top.net, lang, 2)}
            </p>
          )}

          <div className="sectionhead feedhead">
            <h2>{t('feed_title')}</h2>
          </div>
          {market.events.length === 0 ? (
            <p className="empty">{t('feed_empty')}</p>
          ) : (
            <ul className="feed">
              {market.events.slice(0, 7).map((e) => (
                <li key={e.id} className={`feed__item feed__item--${e.type}`}>
                  <span className="feed__mark" aria-hidden="true" />
                  <span>{eventText(e, t, pick, lang)}</span>
                  <span className="feed__time">{ago(e.ts, lang)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="wrap how" aria-labelledby="how-h">
        <h2 id="how-h">{t('how_title')}</h2>
        <ol className="how__list">
          {[1, 2, 3].map((n) => (
            <li key={n}>
              <span className="how__n">{num(n, lang, 0)}</span>
              <h3>{t(`how${n}_h`)}</h3>
              <p>{t(`how${n}_p`)}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
