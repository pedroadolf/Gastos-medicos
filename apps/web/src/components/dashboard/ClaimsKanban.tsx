'use client';

import { motion } from 'framer-motion';
import { Clock, CheckCircle2, CreditCard, XCircle, MoreVertical } from 'lucide-react';

interface Claim {
  id: string;
  patient: string;
  diagnosis: string;
  amount: number;
  date: string;
}

interface Column {
  id: string;
  title: string;
  count: number;
  claims: Claim[];
  color: string;
  icon: any;
}

export function ClaimsKanban() {
  const columns: Column[] = [
    {
      id: 'review',
      title: 'En Trámite / Revisión',
      count: 2,
      color: 'bg-gmm-yellow',
      icon: <Clock size={14} />,
      claims: [
        { id: '225021', patient: 'Pedro', diagnosis: 'Respiratorias', amount: 12500, date: '12 Abr' },
        { id: '323026', patient: 'Claudia', diagnosis: 'Hipertensión', amount: 4500, date: '15 Abr' },
      ]
    },
    {
      id: 'authorized',
      title: 'Pre-autorizados',
      count: 1,
      color: 'bg-gmm-success',
      icon: <CheckCircle2 size={14} />,
      claims: [
        { id: '042024', patient: 'Sebastian', diagnosis: 'Rodilla', amount: 85000, date: '10 Abr' },
      ]
    },
    {
      id: 'payment',
      title: 'En Pago',
      count: 1,
      color: 'bg-blue-500',
      icon: <CreditCard size={14} />,
      claims: [
        { id: '052024', patient: 'Emilio', diagnosis: 'Nariz', amount: 15000, date: '08 Abr' },
      ]
    },
    {
      id: 'rejected',
      title: 'Rechazados / Obs.',
      count: 0,
      color: 'bg-gmm-danger',
      icon: <XCircle size={14} />,
      claims: []
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <div>
          <h3 className="text-[12px] font-black text-gmm-text uppercase tracking-[0.3em]">Flujo de Siniestros</h3>
          <p className="text-[10px] text-gmm-text-muted font-bold uppercase tracking-widest">Estatus de reembolsos en tiempo real</p>
        </div>
        <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black text-gmm-text-muted uppercase tracking-widest italic">
          K-FLOW v2.0 ACTIVE
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <div key={col.id} className="flex flex-col gap-4 min-w-[280px]">
            <div className="flex justify-between items-center p-4 gmm-box">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${col.color} text-black`}>
                  {col.icon}
                </div>
                <h4 className="text-[10px] font-black text-gmm-text uppercase tracking-widest">{col.title}</h4>
              </div>
              <span className="text-xs font-black text-gmm-text-muted">{col.count}</span>
            </div>

            <div className="flex flex-col gap-3">
              {col.claims.length > 0 ? (
                col.claims.map((claim) => (
                  <motion.div
                    key={claim.id}
                    layoutId={claim.id}
                    className="p-4 gmm-box hover:border-gmm-text transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-[8px] font-black text-gmm-text-muted uppercase tracking-widest mb-1">#{claim.id}</p>
                        <p className="text-xs font-black text-gmm-text uppercase tracking-tight">{claim.patient}</p>
                      </div>
                      <button className="text-gmm-text-muted hover:text-gmm-text transition-colors">
                        <MoreVertical size={14} />
                      </button>
                    </div>
                    <p className="text-[10px] font-bold text-gmm-text-muted mb-4 uppercase truncate">{claim.diagnosis}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-black text-gmm-text italic tracking-tighter">${claim.amount.toLocaleString()}</p>
                      <span className="text-[8px] font-black text-gmm-text-muted uppercase tracking-widest">{claim.date}</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="h-24 border border-dashed border-gmm-border rounded-[16px] flex items-center justify-center bg-gmm-bg">
                  <p className="text-[9px] font-black text-gmm-text-muted uppercase tracking-[0.2em]">Cero Siniestros</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
