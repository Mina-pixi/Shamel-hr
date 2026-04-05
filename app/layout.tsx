import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Shamel HR System',
  description: 'Vezeeta Telesales HR Management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ minHeight: '100vh', background: '#0a0e1a' }}>
        {children}
      </body>
    </html>
  );
}
