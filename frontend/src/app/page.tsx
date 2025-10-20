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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />

      <main className="flex-1">
        {/* Hero Section - Only shown when not connected */}
        <Hero />

        {/* Main Content - Only shown when connected */}
        {isConnected && (
          <>
            {/* Stats Section */}
            <section className="container mx-auto px-4 py-8">
              <Stats />
            </section>

            {/* Main Content Grid */}
            <section className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
                {/* Left Column - Deposit Form */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-1 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
                    <h2 className="text-3xl font-black text-gray-900">Create New Lock</h2>
                  </div>
                  <DepositForm />
                </div>

                {/* Right Column - My Deposits */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-1 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full"></div>
                    <h2 className="text-3xl font-black text-gray-900">Your Locks</h2>
                  </div>
                  <MyDeposits />
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section className="container mx-auto px-4 py-16">
              <div className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 md:p-12 shadow-xl">
                <h3 className="text-2xl font-black text-gray-900 mb-6 text-center">
                  Why Choose Piggylock?
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <FeatureItem
                    title="Top Up Anytime"
                    description="Add more funds to existing deposits without creating new locks"
                  />
                  <FeatureItem
                    title="Multi-Asset"
                    description="Support for USDC, ETH, and WBTC in a single platform"
                  />
                  <FeatureItem
                    title="Forward Funds"
                    description="Send unlocked deposits directly to any address"
                  />
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

function FeatureItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center">
      <h4 className="font-bold text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
