import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <div className="hero">
        <h1 style={{fontSize:'clamp(28px,4vw,40px)',margin:0}}>バンコクの子連れ外出、安心ナビ</h1>
        <p style={{color:'var(--muted)',lineHeight:1.6}}>
          授乳室・おむつ替え・ベビーカーの貸し出し、遊び場の有無をまとめました
        </p>
        <div style={{display:'flex',gap:12,marginTop:12}}>
          <Link className="btn btn-primary" href="/spots">スポット一覧を見る →</Link>
        </div>
      </div>
    </main>
  );
}
