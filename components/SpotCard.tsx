import Link from 'next/link';
import type { Spot } from '../app/lib/fetchSpots';

export default function SpotCard({ s }: { s: Spot }) {
  return (
    <article className="card">
      <div className="thumb" />
      <div className="body">
        <h2 className="title">{s.name}</h2>
        <div className="meta">{s.area}｜{s.address}</div>
        <div className="tags">
          {s.nursing && <span className="tag">授乳室</span>}
          {s.diaper && <span className="tag">おむつ替え</span>}
          {s.stroller && <span className="tag">ベビーカー貸出</span>}
          {s.playground === 'free' && <span className="tag">遊び場（無料）</span>}
          {s.playground === 'paid' && <span className="tag">遊び場（有料）</span>}
        </div>
        <div className="cta">
          <Link href={`/spots/${s.slug}`} style={{color:'var(--brand)'}}>詳細を見る →</Link>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address || s.name)}`}
             target="_blank" rel="noopener">Googleマップ</a>
        </div>
      </div>
    </article>
  );
}
