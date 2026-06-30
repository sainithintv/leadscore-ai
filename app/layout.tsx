import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import { AppProvider } from '@/lib/store';

export const metadata: Metadata = {
  title: 'LeadScore AI — LinkedIn Profile Scoring',
  description: 'Score and enrich LinkedIn profiles with AI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden bg-[#0a0a0f]">
        <AppProvider>
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
