'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ConsumptionDonutProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, value }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // If extremely small, just push it a bit outwards so it doesn't overlap text as much
  const isSmall = percent < 0.05;
  const adjustedRadius = isSmall ? outerRadius * 1.05 : radius;
  const adjX = cx + adjustedRadius * Math.cos(-midAngle * RADIAN);
  const adjY = cy + adjustedRadius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={adjX} 
      y={adjY} 
      fill="white" 
      textAnchor="middle" 
      dominantBaseline="central" 
      className="text-[12px] font-black italic drop-shadow-md"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};


export function ConsumptionDonut({ data }: ConsumptionDonutProps) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="gmm-box p-8 h-full">
      <div className="flex justify-between items-center mb-8">
         <div>
            <h3 className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em]">Distribución del Consumo</h3>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-widest">Participación por Asegurado</p>
         </div>
         <div className="text-right">
            <p className="text-[8px] font-black text-slate-400 dark:text-zinc-500 uppercase mb-1">Total Consolidado</p>
            <p className="text-xl font-black text-slate-900 dark:text-white italic tracking-tighter">${(total / 1_000).toLocaleString()}k</p>
         </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--gmm-card)', 
                border: 'none', 
                borderRadius: '16px', 
                fontSize: '10px', 
                boxShadow: 'var(--gmm-shadow)',
                color: 'var(--gmm-text)'
              }}
              itemStyle={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '8px' }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Consumo']}
            />
            <Legend 
               verticalAlign="bottom" 
               align="center"
               iconType="circle"
               wrapperStyle={{ paddingTop: '20px', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--gmm-text)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
