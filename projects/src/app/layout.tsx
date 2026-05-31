import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import { AuthProvider } from '@/lib/auth-context';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '哄哄你 - AI情景模拟练习',
    template: '%s | 哄哄你',
  },
  description:
    '一个基于AI情景模拟的人际冲突沟通训练平台，帮助用户学习在真实冲突场景中如何有效沟通、化解矛盾。',
  keywords: [
    '哄哄你',
    '情商练习',
    '人际沟通',
    '冲突处理',
    'AI模拟',
    '情景练习',
    '沟通技巧',
  ],
  authors: [{ name: '哄哄你' }],
  generator: 'Coze Code',
  openGraph: {
    title: '哄哄你 - AI情景模拟练习',
    description:
      '通过AI情景模拟，练习人际冲突中的沟通技巧，提升情商。',
    url: 'https://example.com',
    siteName: '哄哄你',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN">
      <body className={`antialiased`}>
        <AuthProvider>
          {isDev && <Inspector />}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
