'use client';

import { useAccount } from 'wagmi';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { DepositForm } from '@/components/DepositForm';
import { MyDeposits } from '@/components/MyDeposits';
import { Stats } from '@/components/Stats';
import { Footer } from '@/components/Footer';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <Hero />
        
        {isConnected && (
          <div className="space-y-8">
            <Stats />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <DepositForm />
              <MyDeposits />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}