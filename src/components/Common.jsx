import { useEffect, useRef, useState } from 'react';

export function Sparkline({ data, w = 72, h = 22, color = 'currentColor', strokeWidth = 1.6 }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data
    .map((v, i) => `${((i / (data.length - 1)) * w).toFixed(1)},${(h - 2 - ((v - min) / span) * (h - 4)).toFixed(1)}`)
    .join(' ');
  return (
    <svg className="spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

const reduceMotion = () =>
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// মান বদলালে আগের মান থেকে নতুন মানে গড়িয়ে যায় (প্রভাব পাতার সংখ্যাগুলোর জন্য)
export function Counter({ value, format }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    if (reduceMotion()) {
      from.current = value;
      setShown(value);
      return undefined;
    }
    const start = performance.now();
    const a = from.current;
    const b = value;
    const dur = 700;
    let raf;
    const step = (t) => {
      const k = Math.min(1, (t - start) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      const v = a + (b - a) * e;
      from.current = v;
      setShown(v);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{format(shown)}</>;
}

export function Toast({ msg, onDone }) {
  useEffect(() => {
    if (!msg) return undefined;
    const id = setTimeout(onDone, 6000);
    return () => clearTimeout(id);
  }, [msg, onDone]);
  if (!msg) return null;
  return (
    <div className="toast" role="status" aria-live="polite">
      {msg}
    </div>
  );
}
