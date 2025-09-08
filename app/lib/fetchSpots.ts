export type Spot = {
  slug: string;
  name: string;
  address: string;
  area: string;
  lat: number;
  lng: number;
  nursing: boolean;
  diaper: boolean;
  stroller: boolean;
  playground: 'none'|'free'|'paid';
  hours?: string;
  tips?: string;
};

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let cur = ''; let row: string[] = []; let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], n = text[i+1];
    if (c === '"') { if (inQuotes && n === '"') { cur += '"'; i++; } else { inQuotes = !inQuotes; } }
    else if (c === ',' && !inQuotes) { row.push(cur); cur = ''; }
    else if (c === '\n' && !inQuotes) { row.push(cur); rows.push(row); row = []; cur=''; }
    else { cur += c; }
  }
  row.push(cur); rows.push(row);
  return rows.filter(r => r.some(v => v.trim() !== ''));
}

const yn = (v: string) => /^yes$/i.test((v||'').trim());
const pg = (v: string): 'none'|'free'|'paid' => {
  const t = (v||'').trim().toLowerCase();
  if (t === 'free' || t === '無料') return 'free';
  if (t === 'paid' || t === '有料') return 'paid';
  return 'none';
};

function mapRowsToSpots(rows: string[][]): Spot[] {
  const header = rows[0];
  const idx = (h: string) => header.findIndex(x => x.trim() === h);
  const iName = idx('名前'), iAddr = idx('住所'), iArea = idx('エリア');
  const iLat  = idx('緯度'), iLng = idx('経度');
  const iNur  = idx('授乳室'), iDia = idx('おむつ替え'), iStr = idx('ベビーカー貸出');
  const iPly  = idx('遊び場'), iHrs = idx('営業時間'), iMemo = idx('メモ');

  return rows.slice(1).map((r) => {
    const name = (r[iName] || '').trim();
    const slug = name ? name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') : `spot-${Math.random().toString(36).slice(2,7)}`;
    return {
      slug,
      name,
      address: (r[iAddr] || '').trim(),
      area: (r[iArea] || '').trim() || 'other',
      lat: Number((r[iLat] || '0').trim()),
      lng: Number((r[iLng] || '0').trim()),
      nursing: yn(r[iNur] || ''),
      diaper: yn(r[iDia] || ''),
      stroller: yn(r[iStr] || ''),
      playground: pg(r[iPly] || ''),
      hours: (r[iHrs] || '').trim() || undefined,
      tips: (r[iMemo] || '').trim() || undefined,
    };
  }).filter(s => s.name);
}

export async function fetchSpotsFromSheet(url: string, revalidateSec = 1800) {
  const res = await fetch(url, { next: { revalidate: revalidateSec } });
  if (!res.ok) throw new Error('CSV fetch failed');
  const text = await res.text();
  return mapRowsToSpots(parseCSV(text));
}

export function filterSpots(list: Spot[], params: URLSearchParams) {
  let out = list.slice();
  const n = params.get('n');        // 'yes'
  const p = params.get('p');        // 'free' | 'paid'
  const a = params.get('a');        // area
  if (n === 'yes') out = out.filter(s => s.nursing);
  if (p === 'free' || p === 'paid') out = out.filter(s => s.playground === p);
  if (a) out = out.filter(s => s.area.toLowerCase() === a);
  return out;
}
