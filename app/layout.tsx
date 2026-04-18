import './globals.css';
import { ReactNode } from 'react';
import { Metadata } from 'next';
import Providers from '@/app/providers';

export const metadata: Metadata = {
  title: 'Doc - إحجز موعد مع طبيبك',
  description: 'منصة حجز المواعيد الطبية',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
