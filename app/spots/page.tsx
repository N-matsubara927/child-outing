import Link from 'next/link';
import SpotCard from '../../components/SpotCard';
import { fetchSpotsFromSheet, filterSpots } from '../lib/fetchSpots';

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1l4lIE1otptR5jsYUR3h8iciGVUBmbnliob_eUHX3N5Y/export?format=csv&gid=2088371623';

function filterLink(key: string, val: string, searchParams: URLSearchParams) {
  const params = new URLSearchParams(searchParams);
  const active = params.get(key) === val;
  if (active) { params.delete(key); } else { params.set(key, val); }
  return { href: `?${params.toString()}`, active };
}

export default async function Spots({ searchParams }: { searchParams: { [k: string]: string | string[] | undefined } }) {
  const sp = new URLSearchParams(Object.entries(searchParams).flatMap(([k,v]) => v ? [[k, Array.isArray(v)?v[0]:v]] : []));
  const all = await fetchSpotsFromSheet(SHEET_CSV_URL, 1800); // 30分キャッシュ
  const list = filterSpots(all, sp);

  const links = {
    a1: filterLink('a','khlong-san', sp),
    a2: filterLink('a','pathumwan', sp),
    a3: filterLink('a','watthana', sp),
    n:  filterLink('n','yes', sp),
    pf: filterLink('p','free', sp),
    pp: filterLink('p','paid', sp),
  };

  return (
    <main>
      <h1 style={{fontSize:'clamp(22px,3vw,28px)'}}>スポット一覧</h1>
      <div className="chips" style={{margin:'12px 0 4px'}}>
        <Link className={`chip ${links.a1.active?'btn-primary':''}`} href={links.a1.href}>Khlong San</Link>
        <Link className={`chip ${links.a2.active?'btn-primary':''}`} href={links.a2.href}>Pathumwan</Link>
        <Link className={`chip ${links.a3.active?'btn-primary':''}`} href={links.a3.href}>Watthana</Link>
        <span style={{opacity:.3,margin:'0 4px'}}>|</span>
        <Link className={`chip ${links.n.active?'btn-primary':''}`} href={links.n.href}>授乳室あり</Link>
        <Link className={`chip ${links.pf.active?'btn-primary':''}`} href={links.pf.href}>無料遊び場</Link>
        <Link className={`chip ${links.pp.active?'btn-primary':''}`} href={links.pp.href}>有料遊び場</Link>
      </div>

      <div className="grid" style={{marginTop:12}}>
        {list.length ? list.map(s => <SpotCard key={s.slug} s={s} />) : <p>条件に合うスポットがありません。</p>}
      </div>

      <p className="note">※ 情報は訪問時点のものです。最新状況は各施設の案内をご確認ください。</p>
    </main>
  );
}
