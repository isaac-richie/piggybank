'use client';

import { PiggyBank, Shield, Clock, TrendingUp, Sparkles } from 'lucide-react';
import { useAccount } from 'wagmi';

export function Hero() {
  const { isConnected } = useAccount();

  if (isConnected) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl blur-2xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 rounded-3xl shadow-2xl">
                <PiggyBank className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-purple-700 shadow-lg mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Secure • Time-Locked • DeFi Savings</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            Save Smarter with
            <br />
            AssetStrategy
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-2xl mx-auto leading-relaxed">
            Lock your crypto assets for set periods and earn the discipline to reach your financial goals. Built on Base with smart contract security.
          </p>

          {/* CTA Button is in Header */}
          <div className="text-sm text-gray-600 mb-12">
            👆 Connect your wallet above to get started
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Secure"
              description="Battle-tested smart contracts on Base"
              color="indigo"
            />
            <FeatureCard
              icon={<Clock className="h-6 w-6" />}
              title="Time-Locked"
              description="3, 6, 9, or 12 month lock periods"
              color="purple"
            />
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6" />}
              title="Multi-Asset"
              description="USDC, ETH, and WBTC supported"
              color="pink"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  color 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  color: 'indigo' | 'purple' | 'pink';
}) {
  const colorClasses = {
    indigo: 'from-indigo-500 to-indigo-600',
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600',
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white mb-4 shadow-lg`}>
        {icon}
      </div>
      <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
