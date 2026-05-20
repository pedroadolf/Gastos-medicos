'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, CreditCard, XCircle, MoreVertical, Loader2 } from 'lucide-react';
import { ASEGURADOS_GRUPO } from '@/lib/siniestros-data';

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
  const [tramites, setTramites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch('/api/tramites')
      .then(res => res.json())
      .then(data => {
        if (active && Array.isArray(data)) {
          setTramites(data);
        }
      })
      .catch(err => console.error("Error fetching tramites:", err))
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, []);

  const getPatientName = (t: any) => {
    if (t.paciente_nombre) return t.paciente_nombre;
    const numSiniestro = t.siniestros?.numero_siniestro;
    if (numSiniestro) {
      const found = ASEGURADOS_GRUPO.find(asegurado => 
        asegurado.siniestros.some(s => s.numero.startsWith(numSiniestro) || numSiniestro.startsWith(s.numero))
      );
      if (found) return found.nombre.split(' ')[0];
    }
    return 'Claudia';
  };

  const getDiagnosis = (t: any) => {
    if (t.siniestros?.nombre_siniestro) return t.siniestros.nombre_siniestro;
    const numSiniestro = t.siniestros?.numero_siniestro;
    if (numSiniestro) {
      const found = ASEGURADOS_GRUPO.flatMap(a => a.siniestros).find(s => 
        s.numero.startsWith(numSiniestro) || numSiniestro.startsWith(s.numero)
      );
      if (found) return found.padecimiento;
    }
    return 'Trámite General';
  };

  const getFormattedDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
    } catch (e) {
      return 'Reciente';
    }
  };

  const getAmount = (t: any) => {
    if (Array.isArray(t.facturas) && t.facturas.length > 0) {
      return t.facturas.reduce((acc: number, f: any) => acc + (f.importe || 0), 0);
    }
    return 0;
  };

  const getColumnClaims = (colId: string): Claim[] => {
    return tramites
      .filter(t => {
        const status = (t.status || '').toLowerCase();
        if (colId === 'review') {
          return status === 'borrador' || status === 'en_revision' || status === 'pending';
        }
        if (colId === 'payment') {
          return status === 'processing' || status === 'procesando';
        }
        if (colId === 'authorized') {
          return status === 'completado' || status === 'completed' || status === 'audited';
        }
        if (colId === 'rejected') {
          return status === 'rechazado' || status === 'rejected' || status === 'error_audit';
        }
        return false;
      })
      .map(t => ({
        id: t.id.substring(0, 8).toUpperCase(),
        patient: getPatientName(t),
        diagnosis: getDiagnosis(t),
        amount: getAmount(t),
        date: getFormattedDate(t.created_at || new Date().toISOString())
      }));
  };

  const columns: Column[] = [
    {
      id: 'review',
      title: 'En Trámite / Revisión',
      count: getColumnClaims('review').length,
      color: 'bg-gmm-yellow',
      icon: <Clock size={14} />,
      claims: getColumnClaims('review')
    },
    {
      id: 'authorized',
      title: 'Pre-autorizados',
      count: getColumnClaims('authorized').length,
      color: 'bg-gmm-success',
      icon: <CheckCircle2 size={14} />,
      claims: getColumnClaims('authorized')
    },
    {
      id: 'payment',
      title: 'En Pago',
      count: getColumnClaims('payment').length,
      color: 'bg-blue-500',
      icon: <CreditCard size={14} />,
      claims: getColumnClaims('payment')
    },
    {
      id: 'rejected',
      title: 'Rechazados / Obs.',
      count: getColumnClaims('rejected').length,
      color: 'bg-gmm-danger',
      icon: <XCircle size={14} />,
      claims: getColumnClaims('rejected')
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

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-48 bg-white/5 border border-gmm-border rounded-[24px] backdrop-blur-sm">
          <Loader2 className="animate-spin text-medical-cyan mb-2" size={32} />
          <p className="text-[10px] font-black text-gmm-text-muted uppercase tracking-widest">
            Sincronizando con n8n Engine...
          </p>
        </div>
      ) : (
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
                  col.claims.map((claim, index) => (
                    <motion.div
                      key={claim.id}
                      layoutId={claim.id}
                      className={`p-4 gmm-box hover:border-blue-500/50 transition-colors ${index % 2 === 0 ? 'bg-slate-50/50 dark:bg-white/5' : 'bg-white dark:bg-white/[0.02]'}`}
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
      )}
    </div>
  );
}
