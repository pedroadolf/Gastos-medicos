// apps/web/src/components/tramites/TramiteStatusBadge.tsx
'use client';

import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RefreshCcw,
  Zap,
  FileSearch,
  PenTool
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatusType = 'borrador' | 'procesando' | 'en_revision' | 'rechazado' | 'completado';

interface TramiteStatusBadgeProps {
  status: StatusType;
  progress?: number;
  className?: string;
}

const statusConfigs: Record<StatusType, { label: string; icon: any; color: string; bg: string; border: string; animate?: string }> = {
  borrador: {
    label: 'Borrador',
    icon: PenTool,
    color: 'text-slate-400',
    bg: 'bg-slate-400/10',
    border: 'border-slate-400/20',
  },
  procesando: {
    label: 'Procesando',
    icon: RefreshCcw,
    color: 'text-medical-cyan',
    bg: 'bg-medical-cyan/10',
    border: 'border-medical-cyan/20',
    animate: 'animate-spin',
  },
  en_revision: {
    label: 'En Revisión',
    icon: FileSearch,
    color: 'text-medical-amber',
    bg: 'bg-medical-amber/10',
    border: 'border-medical-amber/20',
  },
  rechazado: {
    label: 'Rechazado',
    icon: AlertCircle,
    color: 'text-medical-red',
    bg: 'bg-medical-red/10',
    border: 'border-medical-red/20',
  },
  completado: {
    label: 'Completado',
    icon: CheckCircle2,
    color: 'text-medical-emerald',
    bg: 'bg-medical-emerald/10',
    border: 'border-medical-emerald/20',
  },
};

export function TramiteStatusBadge({ status, progress, className }: TramiteStatusBadgeProps) {
  const config = statusConfigs[status] || statusConfigs.borrador;
  const Icon = config.icon;

  return (
    <div className={cn("flex flex-col gap-1.5 min-w-[120px]", className)}>
      <span className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest",
        config.color,
        config.bg,
        config.border
      )}>
        <Icon size={12} className={config.animate} />
        {config.label}
      </span>
      {status === 'procesando' && typeof progress === 'number' && (
        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-medical-cyan transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      )}
    </div>
  );
}
