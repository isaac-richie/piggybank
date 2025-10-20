'use client';

import { useTimelockPiggyBank } from '@/hooks/useContract';
import { Wallet, TrendingUp, Package, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function Stats() {
  const {
    activeDepositCount,
    totalLockedUSDC,
    totalLockedETH,
    totalLockedWBTC,
  } = useTimelockPiggyBank();

  const stats = [
    {
      label: 'Active Deposits',
      value: activeDepositCount,
      icon: <Package className="h-5 w-5" />,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
    },
    {
      label: 'Locked USDC',
      value: `${totalLockedUSDC}`,
      icon: <Wallet className="h-5 w-5" />,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
    },
    {
      label: 'Locked ETH',
      value: `${parseFloat(totalLockedETH).toFixed(4)}`,
      icon: <TrendingUp className="h-5 w-5" />,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50',
    },
    {
      label: 'Locked WBTC',
      value: `${parseFloat(totalLockedWBTC).toFixed(6)}`,
      icon: <Activity className="h-5 w-5" />,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card
          key={stat.label}
          className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 overflow-hidden"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className={`h-1 bg-gradient-to-r ${stat.gradient}`}></div>
          <CardContent className={`pt-6 pb-5 bg-gradient-to-br ${stat.bgGradient}`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient} shadow-md group-hover:scale-110 transition-transform`}>
                <div className="text-white">{stat.icon}</div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-gray-900 tracking-tight">
                {stat.value}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
