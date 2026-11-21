import { useEffect, useState } from 'react';
import { LangProvider, useLang } from './lang';
import { useMarket } from './hooks/useMarket';
import BoardView from './views/BoardView';
import SellView from './views/SellView';
import BuyView from './views/BuyView';
import ValueView from './views/ValueView';
import ImpactView from './views/ImpactView';

const ROUTES = ['board', 'sell', 'buy', 'value', 'impact'];

const parseRoute = () => {
  const r = window.location.hash.replace(/^#\/?/, '').split('?')[0];
  return ROUTES.includes(r) ? r : 'board';
};

function useRoute() {
  const [route, setRoute] = useState(parseRoute);
  useEffect(() => {
    const h = () => setRoute(parseRoute());
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);
  return route;
}

function Mark() {
  return (
    <svg className="mark" viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="9" fill="#14382C" />
      <circle cx="20" cy="20" r="12.5" fill="none" stroke="#7FD6A0" strokeWidth="3.2" strokeDasharray="30 9" strokeLinecap="round" transform="rotate(-30 20 20)" />
      <path d="M14 24C14 15 21 11 27 13C27 21 21 26 14 24Z" fill="#F0B323" />
    </svg>
  );
}

function Shell({ lang, setLang, route, market }) {
  const { t } = useLang();

  useEffect(() => {
    document.title = `${t('brand')} — ${t('tagline')}`;
  }, [t]);

  const View = { board: BoardView, sell: SellView, buy: BuyView, value: ValueView, impact: ImpactView }[route];

  return (
    <>
      <a className="skip" href="#main">{t('skip')}</a>
      <div className="demo" role="note">
        <div className="wrap">{t('demo')}</div>
      </div>
      <header className="top">
        <div className="wrap top__in">
          <a className="brand" href="#/board">
            <Mark />
            <span>{t('brand')}</span>
          </a>
          <nav className="nav" aria-label={t('nav_label')}>
            {ROUTES.map((r) => (
              <a key={r} href={`#/${r}`} aria-current={route === r ? 'page' : undefined}>
                {t(`nav_${r}`)}
              </a>
            ))}
          </nav>
          <button
            type="button"
            className="langbtn"
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            lang={lang === 'bn' ? 'en' : 'bn'}
          >
            {t('lang_switch')}
          </button>
        </div>
      </header>

      <main id="main">
        <View market={market} />
      </main>

      <footer className="footer">
        <div className="wrap">
          <p><strong>{t('brand')}</strong> — {t('tagline')}</p>
          <p>{t('footer_note')}</p>
          <p>{t('footer_data')}</p>
        </div>
      </footer>
    </>
  );
}

export default function App() {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('khamarchakra.lang') === 'en' ? 'en' : 'bn';
    } catch {
      return 'bn';
    }
  });
  const route = useRoute();
  const market = useMarket();

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem('khamarchakra.lang', lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  return (
    <LangProvider lang={lang}>
      <Shell lang={lang} setLang={setLang} route={route} market={market} />
    </LangProvider>
  );
}
