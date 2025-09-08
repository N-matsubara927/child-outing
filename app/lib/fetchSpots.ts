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

/** CSVパーサ（"対応・改行OK） */
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

/** 文字を正規化（全角→半角、小文字化、空白除去） */
function norm(s: string) {
  return (s||'')
    .replace(/[　]/g,' ')
    .trim()
    .toLowerCase();
}

/** 列名を別名リストで探す */
function findIdx(header: string[], aliases: string[]): number {
  const H = header.map(norm);
  for (const a of aliases) {
    const i = H.findIndex(h => h === norm(a));
    if (i !== -1) return i;
  }
  return -1;
}

/** Yes/No 多言語・表記ゆれ対応 */
const yn = (v: string) => {
  const t = norm(v);
  return ['yes','y','true','1','ok','あり','有','はい','○','◯','可','可能'].includes(t);
};

/** playground の表記ゆれ */
const pg = (v: string): 'none'|'free'|'paid' => {
  const t = norm(v);
  if (['free','無料','free(無料)','no charge'].includes(t)) return 'free';
  if (['paid','有料','charge','有料あり'].includes(t)) return 'paid';
  return 'none';
};

/** ヘッダーの別名一覧（この中のどれかに合えばOK） */
const COLS = {
  name: ['名前','施設名','スポット名','名称','name','title'],
  address: ['住所','所在地','address','location'],
  area: ['エリア','地域','区','エリア名','area'],
  lat: ['緯度','lat','latitude'],
  lng: ['経度','lng','longitude'],
  nursing: ['授乳室','授乳','nursing','nursing room'],
  diaper: ['おむつ替え','オムツ替え','オムツ交換','おむつ交換','diaper','changing table'],
  stroller: ['ベビーカー貸出','ベビーカー','ベビーカーの貸し出し','stroller','stroller rental'],
  playground: ['遊び場','キッズスペース','プレイエリア','playground','kids area'],
  hours: ['営業時間','時間','hours','opening hours'],
  tips: ['メモ','備考','ポイント','tips','note'],
};

/** CSV行を Spot[] に変換（ヘッダーゆらぎ対応） */
function mapRowsToSpots(rows: string[][]): Spot[] {
  const header = rows[0] || [];
  const iName = findIdx(header, COLS.name);
  const iAddr = findIdx(header, COLS.address);
  const iArea = findIdx(header, COLS.area);
  const iLat  = findIdx(header, COLS.lat);
  const iLng  = findIdx(header, COLS.lng);
  const iNur  = findIdx(header, COLS.nursing);
  const iDia  = findIdx(header, COLS.diaper);
  const iStr  = findIdx(header, COLS.stroller);
  const iPly  = findIdx(header, COLS.playground);
  const iHrs  = findIdx(header, COLS.hours);
  const iTip  = findIdx(header, COLS.tips);

  return rows.slice(1).map((r) => {
    const get = (i: number) => (i >= 0 ? (r[i] ?? '').toString() : '');
    const name = get(iName).trim();
    const slug = name
      ? name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')
      : `spot-${Math.random().toString(36).slice(2,7)}`;

    const lat = Number(get(iLat).replace(/[^\d.\-]/g,''));
    const lng = Number(get(iLng).replace(/[^\d.\-]/g,''));

    return {
      slug,
      name,
      address: get(iAddr).trim(),
      area: get(iArea).trim() || 'other',
      lat: isFinite(lat) ? lat : 0,
      lng: isFinite(lng) ? lng : 0,
      nursing: yn(get(iNur)),
      diaper: yn(get(iDia)),
      stroller: yn(get(iStr)),
      playground: pg(get(iPly)),
      hours: get(iHrs).trim() || undefined,
      tips: get(iTip).trim() || undefined,
    };
  }).filter(s => s.name); // 名前空は除外
}

/** シートCSVを取得（30分キャッシュ） */
export async function fetchSpotsFromSheet(url: string, revalidateSec = 1800): Promise<Spot[]> {
  const res = await fetch(url, { next: { revalidate: revalidateSec } });
  if (!res.ok) throw new Error('CSV fetch failed');
  const text = await res.text();
  return mapRowsToSpots(parseCSV(text));
}

export function filterSpots(list: Spot[], params: URLSearchParams) {
  let out = list.slice();
  const n = params.get('n');        // 'yes'
  const p = params.get('p');        // 'free' | 'paid'
  const a = params.get('a');        // area (lowercase)
  if (n === 'yes') out = out.filter(s => s.nursing);
  if (p === 'free' || p === 'paid') out = out.filter(s => s.playground === p);
  if (a) out = out.filter(s => norm(s.area) === norm(a));
  return out;
}
