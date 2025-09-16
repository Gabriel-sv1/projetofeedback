import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'Pesquisa de Satisfação - Venturini&Co',
  description: 'Sistema de feedback e avaliação de satisfação do cliente',
  keywords: 'pesquisa, satisfação, feedback, avaliação, NPS',
  authors: [{ name: 'Venturini&Co' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'noindex, nofollow', // Para sistema interno
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        {/* Preload de recursos críticos */}
        <link rel="preload" href="/venturini-logo.png" as="image" type="image/png" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preconnect" href="//fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Meta tags de performance */}
        <meta name="theme-color" content="#0f172a" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        
        {/* Preload de CSS crítico */}
        <link rel="preload" href="/_next/static/css/app/layout.css" as="style" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
