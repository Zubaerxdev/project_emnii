export const MAP_W = 420;
export const MAP_H = 560;

// lng 88.0–92.7, lat 20.6–26.7 কে SVG-র 420×560 এ প্রজেক্ট করা (সরল প্রজেকশন)।
export const project = ({ lat, lng }) => [
  ((lng - 88.0) / 4.7) * MAP_W,
  ((26.7 - lat) / 6.1) * MAP_H,
];

// বাংলাদেশের সীমানার সরলীকৃত রূপরেখা [lng, lat] — শুধু দৃশ্যের জন্য, নির্ভুল সীমানা নয়।
const OUTLINE = [
  [88.2, 26.55], [88.6, 26.45], [89.0, 26.3], [89.4, 26.05], [89.75, 25.65], [89.85, 25.3],
  [90.4, 25.15], [91.0, 25.15], [91.6, 25.15], [92.0, 25.05], [92.25, 24.88],
  [92.1, 24.4], [91.85, 24.15], [91.7, 23.6], [91.85, 23.0], [92.35, 22.95], [92.45, 22.2],
  [92.6, 21.8], [92.32, 20.75], [92.0, 21.3], [91.85, 22.15], [91.45, 22.55], [91.05, 22.45],
  [90.6, 22.15], [90.2, 21.8], [89.8, 21.75], [89.3, 21.7], [88.95, 21.95],
  [88.85, 22.5], [88.8, 23.05], [88.55, 23.5], [88.3, 23.95], [88.1, 24.4], [88.05, 24.95],
  [88.0, 25.5], [88.15, 26.0],
];

export const OUTLINE_PATH =
  OUTLINE.map(([lng, lat], i) => {
    const [x, y] = project({ lat, lng });
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ') + ' Z';

export function haversine(a, b) {
  const R = 6371;
  const toR = (d) => (d * Math.PI) / 180;
  const dLat = toR(b.lat - a.lat);
  const dLng = toR(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
