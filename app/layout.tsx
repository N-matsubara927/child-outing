export const metadata = {
  title: '子連れ外出ナビ – Bangkok',
  description: '授乳室・おむつ替え・ベビーカーの貸し出し、遊び場の有無をまとめました',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
