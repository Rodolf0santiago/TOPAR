import type { Metadata } from 'next';
import './globals.css';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'OKKA | Piso Aquecido & Conforto Térmico de Alto Padrão',
  description:
    'Sistemas de calefação por piso radiante elétrico ou hidráulico de alta performance. Conforto térmico invisível, seguro e sob medida para sua residência.',
  keywords: ['piso aquecido', 'calefação', 'conforto térmico', 'climatização residencial', 'pisos radiantes', 'OKKA'],
  authors: [{ name: 'OKKA Climatização' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className="antialiased min-h-screen flex flex-col bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
