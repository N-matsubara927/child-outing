import Link from 'next/link';
import { fetchSpotsFromSheet } from '../../lib/fetchSpots';

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1l4lIE1otptR5jsYUR3h8iciGVUBmbnliob_eUHX3N5Y/export?format=csv&gid=2088371623';

export default async function SpotDetail({ params }: { params: { slug: string } }) {
  const all = await fetchSpotsFromSheet(SHEET_CSV_URL, 1800);
  const spot = all.find(s => s.slug === params.slug);
  if (!spot) return <main><p>スポットが見つかりません。</p></main>;

  return (
    <main>
      <header>
        <h1 style={{fontSize:'clamp(22px,3vw,28px)',marginBottom:6}}>{spot.name}</h1>
        <div className="badges">
          {spot.nursing && <span className="badge">授乳室</span>}
          {spot.diaper && <span className="badge">おむつ替え</span>}
          {spot.stroller && <span className="badge">ベビーカー貸出</span>}
          {spot.playground === 'free' && <span className="badge">遊び場（無料）</span>}
          {spot.playground === 'paid' && <span className="badge">遊び場（有料）</span>}
        </div>
        <div style={{color:'var(--muted)',margin:'6px 0 16px'}}>
          {spot.area}｜{spot.address}{spot.hours ? `｜${spot.hours}` : ''}
        </div>
      </header>

      <div className="grid2">
        <section className="box">
          <h3 style={{margin:'0 0 10px',fontSize:16}}>子連れ目線のポイント</h3>
          <p style={{lineHeight:1.7}}>{spot.tips || '準備中です。'}</p>
          <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:12}}>
            <a className="btn" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.address || spot.name)}`} target="_blank" rel="noopener">Googleマップで開く</a>
            <Link className="btn" href="/spots">一覧に戻る</Link>
          </div>
        </section>

        <aside className="box map">
          <h3 style={{margin:'0 0 10px',fontSize:16}}>地図</h3>
          <iframe loading="lazy"
            src={`https://maps.google.com/maps?q=${spot.lat},${spot.lng}&hl=ja&z=16&output=embed`}>
          </iframe>
        </aside>
      </div>

      <p className="note">※ 情報は変わる可能性があります。最新の貸出条件・設備状況は館内案内をご確認ください。</p>
    </main>
  );
}
