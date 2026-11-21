import { useMemo } from 'react';
import { WASTE, wasteById } from '../data/wasteTypes';
import { districtById } from '../data/districts';
import { taka, num, kgLabel, co2Label } from '../lib/format';
import { Counter, Sparkline } from '../components/Common';
import { useLang } from '../lang';

const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);

export default function ImpactView({ market }) {
  const { t, pick, lang } = useLang();
  const { tally, prices } = market;
  const kg = sum(tally.byWaste);

  const byWaste = useMemo(
    () => Object.entries(tally.byWaste).sort((a, b) => b[1] - a[1]),
    [tally.byWaste]
  );
  const byDistrict = useMemo(
    () => Object.entries(tally.byDistrict).sort((a, b) => b[1] - a[1]).slice(0, 8),
    [tally.byDistrict]
  );
  const index = useMemo(() => {
    const n = prices[WASTE[0].id].hist.length;
    return Array.from({ length: n }, (_, i) =>
      (WASTE.reduce((acc, w) => acc + prices[w.id].hist[i] / w.base, 0) / WASTE.length) * 100
    );
  }, [prices]);
  const idxNow = index[index.length - 1];

  const maxW = byWaste[0] ? byWaste[0][1] : 1;
  const maxD = byDistrict[0] ? byDistrict[0][1] : 1;

  return (
    <div className="wrap">
      <header className="pagehead">
        <h1>{t('impact_title')}</h1>
        <p>{t('impact_intro')}</p>
      </header>

      <div className="kpis">
        <div className="kpi">
          <div className="kpi__v"><Counter value={kg} format={(v) => kgLabel(Math.round(v), lang)} /></div>
          <div className="kpi__l">{t('kg_diverted')}</div>
        </div>
        <div className="kpi">
          <div className="kpi__v"><Counter value={tally.income} format={(v) => taka(Math.round(v), lang, 0)} /></div>
          <div className="kpi__l">{t('income_total')}</div>
        </div>
        <div className="kpi">
          <div className="kpi__v"><Counter value={tally.co2} format={(v) => co2Label(v, lang)} /></div>
          <div className="kpi__l">{t('co2_total')}</div>
        </div>
        <div className="kpi">
          <div className="kpi__v"><Counter value={tally.deals} format={(v) => num(Math.round(v), lang, 0)} /></div>
          <div className="kpi__l">{t('deals_total')}</div>
        </div>
      </div>

      <div className="layout2">
        <section aria-labelledby="bw-h">
          <div className="sectionhead"><h2 id="bw-h">{t('by_waste')}</h2></div>
          <ul className="hbars">
            {byWaste.map(([id, v]) => (
              <li key={id} className="hbar">
                <span>{pick(wasteById(id))}</span>
                <span className="hbar__track"><span className="hbar__fill" style={{ width: `${(v / maxW) * 100}%` }} /></span>
                <span className="hbar__v">{kgLabel(v, lang)}</span>
              </li>
            ))}
          </ul>
        </section>

        <div>
          <section aria-labelledby="bd-h">
            <div className="sectionhead"><h2 id="bd-h">{t('by_district')}</h2></div>
            <ul className="hbars">
              {byDistrict.map(([id, v]) => (
                <li key={id} className="hbar">
                  <span>{pick(districtById(id))}</span>
                  <span className="hbar__track"><span className="hbar__fill" style={{ width: `${(v / maxD) * 100}%` }} /></span>
                  <span className="hbar__v">{kgLabel(v, lang)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="indexblock" aria-labelledby="ix-h">
            <div className="sectionhead"><h2 id="ix-h">{t('index_title')}</h2></div>
            <p className="indexval">{num(idxNow, lang, 1)}</p>
            <Sparkline data={index} w={360} h={72} color="#1F6B4A" strokeWidth={2.2} />
            <p className="hint">{t('index_note')}</p>
          </section>
        </div>
      </div>

      <p className="callout">{t('impact_note')}</p>
    </div>
  );
}
