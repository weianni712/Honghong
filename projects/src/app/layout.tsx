import type { Metadata, Viewport } from 'next';
import { Inspector } from 'react-dev-inspector';
import { AuthProvider } from '@/lib/auth-context';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/sonner';
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'),
  openGraph: {
    title: '哄哄你 - AI情景模拟练习',
    description:
      '通过AI情景模拟，练习人际冲突中的沟通技巧，提升情商。',
    siteName: '哄哄你',
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '哄哄你 - AI情景模拟练习',
    description: '通过AI情景模拟，练习人际冲突中的沟通技巧，提升情商。',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fdf2f8' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a2e' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased min-h-screen">
        <ErrorBoundary>
          <AuthProvider>
            {isDev && <Inspector />}
            {children}
            <Toaster position="top-center" richColors />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
