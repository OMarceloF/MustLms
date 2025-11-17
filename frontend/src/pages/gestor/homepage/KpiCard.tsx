'use client';

import { Card } from '../components/ui/card';
import { ArrowUp, ArrowDown, Users, UserCheck, UserCircle, Layers, CheckCircle, Activity } from 'lucide-react';
import { KpiData } from '../../lib/mock-data';

interface KpiCardProps {
  data: KpiData;
}

const iconMap = {
  users: Users,
  'user-check': UserCheck,
  'user-circle': UserCircle,
  layers: Layers,
  'check-circle': CheckCircle,
  activity: Activity,
};

export function KpiCard({ data }: KpiCardProps) {
  const Icon = iconMap[data.icon as keyof typeof iconMap] || Users;
  const isPositive = data.trend >= 0;

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-[#363776] to-[#1e1f45] border-none shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
      {/* Efeito de brilho sutil */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
      
      <div className="relative p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="inline-flex p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 mb-3">
              <Icon className="h-6 w-6 text-white" />
            </div>
            
            <h3 className="text-xs font-medium text-white/70 uppercase tracking-wide mb-2">
              {data.title}
            </h3>
            
            <div className="flex items-end gap-2">
              <p className="text-4xl font-bold text-white leading-none">
                {data.value}
              </p>
              
              {data.trend !== 0 && (
                <div className={`flex items-center gap-1 pb-1 ${isPositive ? 'text-[#9dba32]' : 'text-red-400'}`}>
                  {isPositive ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                  <span className="text-sm font-bold">
                    {Math.abs(data.trend)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="pt-3 border-t border-white/10">
          <span className="text-xs text-white/50 font-medium">
            {data.period}
          </span>
        </div>
      </div>
    </Card>
  );
}
