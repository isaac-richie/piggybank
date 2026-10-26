'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AdminPanel } from '@/components/AdminPanel';

export default function AdminPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <AdminPanel />
      </main>
      <Footer />
    </div>
  );
}
