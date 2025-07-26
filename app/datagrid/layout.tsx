import * as React from 'react';
import type { Metadata } from 'next';
import ThemeRegistry from './ThemeRegistry';

export const metadata: Metadata = {
  title: 'DataGrid Example',
  description: 'MUI DataGrid with Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/*
        修正: suppressHydrationWarningをbodyタグに追加します。
        これは、MUI、Tailwind CSS、Next.jsの間の複雑なスタイルの競合によって
        引き起こされるハイドレーションエラーを抑制するための最後の手段です。
        サーバーとクライアントでクラス名が異なっていても、Reactはこの警告を無視します。
      */}
      <body suppressHydrationWarning={true}>
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
