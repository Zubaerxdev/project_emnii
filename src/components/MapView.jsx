import { useMemo } from 'react';
import { DISTRICTS, districtById } from '../data/districts';
import { BUYERS } from '../data/buyers';
import { OUTLINE_PATH, MAP_W, MAP_H, project } from '../lib/geo';
import { useLang } from '../lang';

export default function MapView({ listings, selected, highlight, matches, newestId }) {
  const { t, pick } = useLang();

  const vis = useMemo(
    () => (selected ? listings.filter((l) => l.wasteId === selected) : listings),
    [listings, selected]
  );

  const groups = useMemo(() => {
    const m = {};
    vis.forEach((l) => {
      if (!m[l.districtId]) m[l.districtId] = [];
      m[l.districtId].push(l);
    });
    return m;
  }, [vis]);

  const newest = listings.find((l) => l.id === newestId);
  const from = highlight ? districtById(highlight.districtId) : null;
  const topIds = new Set(matches.map((m) => m.buyer.id));

  return (
    <figure className="mapbox">
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="map" role="img" aria-label={t('map_title')}>
        <path d={OUTLINE_PATH} className="map__land" />

        {DISTRICTS.map((d) => {
          const [x, y] = project(d);
          return <circle key={d.id} cx={x} cy={y} r="1.8" className="map__d" />;
        })}

        {from &&
          matches.map((m) => {
            const [x1, y1] = project(from);
            const [x2, y2] = project(districtById(m.buyer.district));
            return <line key={m.buyer.id} x1={x1} y1={y1} x2={x2} y2={y2} className="map__link" />;
          })}

        {Object.entries(groups).map(([id, arr]) => {
          const [x, y] = project(districtById(id));
          const r = 4 + Math.sqrt(arr.length) * 2.6;
          return (
            <g key={id}>
              <circle cx={x} cy={y} r={r} className="map__listing" />
              <title>{`${pick(districtById(id))}: ${arr.length}`}</title>
            </g>
          );
        })}

        {BUYERS.map((b) => {
          const [x, y] = project(districtById(b.district));
          return (
            <g key={b.id} transform={`translate(${x} ${y})`}>
              <rect x="-4.5" y="-4.5" width="9" height="9" transform="rotate(45)" className={`map__buyer ${topIds.has(b.id) ? 'is-on' : ''}`} />
              <title>{pick(b)}</title>
            </g>
          );
        })}

        {newest && (() => {
          const [x, y] = project(districtById(newest.districtId));
          return <circle key={newest.id} cx={x} cy={y} r="6" className="map__pulse" />;
        })()}

        {from && (() => {
          const [x, y] = project(from);
          return <circle cx={x} cy={y} r="13" className="map__ring" />;
        })()}
      </svg>
      <figcaption>
        <div className="legend">
          <span><i className="dot" aria-hidden="true" />{t('legend_listing')}</span>
          <span><i className="dia" aria-hidden="true" />{t('legend_buyer')}</span>
        </div>
        <p className="mapnote">{t('map_note')}</p>
      </figcaption>
    </figure>
  );
}
