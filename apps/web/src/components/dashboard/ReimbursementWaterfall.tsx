'use client';

import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts';

interface WaterfallData {
  name: string;
  value: number;
  displayValue: number;
  base: number;
  color: string;
  isTotal?: boolean;
}

const rawData = [
  { name: 'Presentado', value: 150000, type: 'start' },
  { name: 'No Cubierto', value: -12500, type: 'step' },
  { name: 'Deducible', value: -15000, type: 'step' },
  { name: 'Coaseguro', value: -12250, type: 'step' },
  { name: 'Reembolso', value: 110250, type: 'total' },
];

export function ReimbursementWaterfall() {
  // Transform data for Waterfall effect in Recharts
  let cumulative = 0;
  const data: WaterfallData[] = rawData.map((item, index) => {
    const isTotal = item.type === 'total';
    const isStart = item.type === 'start';
    
    let base = 0;
    let displayValue = Math.abs(item.value);
    
    if (isStart || isTotal) {
      base = 0;
      displayValue = item.value;
      if (isStart) cumulative = item.value;
    } else {
      if (item.value < 0) {
        cumulative += item.value;
        base = cumulative;
      } else {
        base = cumulative;
        cumulative += item.value;
      }
    }

    return {
      name: item.name,
      value: item.value,
      displayValue,
      base,
      color: isTotal ? '#22C55E' : isStart ? '#343434' : item.value < 0 ? '#B22B21' : '#FFAA00',
      isTotal
    };
  });

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="gmm-pill-card bg-white dark:bg-[#1A1A1A] border-none shadow-2xl p-8 h-full">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-[12px] font-black text-gmm-text uppercase tracking-[0.3em] mb-1">Desglose de Reembolso</h3>
          <p className="text-[10px] text-gmm-text-muted font-bold uppercase tracking-widest">Siniestro #01210200485</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-gmm-text-muted uppercase mb-1">Total a Recibir</p>
          <p className="text-xl font-black text-green-500 tracking-tighter">{formatCurrency(110250)}</p>
        </div>
      </div>

      <div className="h-[300px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
            <XAxis 
              dataKey="name" 
              fontSize={9} 
              fontWeight="black" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'currentColor', opacity: 0.5 }}
              textAnchor="middle"
            />
            <YAxis hide />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#1A1A1A] border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
                      <p className="text-[10px] font-black text-white/40 uppercase mb-2 tracking-widest">{data.name}</p>
                      <p className="text-sm font-black text-white">
                        {data.value > 0 ? '+' : ''}{formatCurrency(data.value)}
                      </p>
                      {!data.isTotal && (
                         <p className="text-[8px] font-bold text-white/30 uppercase mt-2">
                           Impacto en el saldo final
                         </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            
            {/* Base bar (transparent) to lift the value bar */}
            <Bar dataKey="base" stackId="a" fill="transparent" />
            
            {/* The actual value bar */}
            <Bar dataKey="displayValue" stackId="a" radius={[4, 4, 4, 4]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gmm-text/5">
        <div className="text-center">
          <p className="text-[8px] font-black text-gmm-text-muted uppercase mb-1">Gasto Seguro</p>
          <p className="text-[11px] font-black text-gmm-text">$137,500</p>
        </div>
        <div className="text-center">
          <p className="text-[8px] font-black text-gmm-text-muted uppercase mb-1">Retenciones</p>
          <p className="text-[11px] font-black text-gmm-danger">-$27,250</p>
        </div>
        <div className="text-center">
          <p className="text-[8px] font-black text-gmm-text-muted uppercase mb-1">% Recuperación</p>
          <p className="text-[11px] font-black text-green-500">73.5%</p>
        </div>
      </div>
    </div>
  );
}
