// apps/web/src/components/tramites/ScoreBadge.tsx
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
  score?: number;
  className?: string;
}

export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  if (score === undefined || score === 0) {
    return <span className={cn("text-[10px] text-slate-600 font-bold uppercase tracking-widest", className)}>N/A</span>;
  }

  let colorClass = "bg-medical-red/10 border-medical-red text-medical-red";
  if (score >= 90) colorClass = "bg-medical-emerald/10 border-medical-emerald text-medical-emerald";
  else if (score >= 70) colorClass = "bg-medical-amber/10 border-medical-amber text-medical-amber";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "w-9 h-9 rounded-xl flex items-center justify-center border text-[11px] font-black shadow-inner transition-all",
        colorClass
      )}>
        {score}%
      </div>
      {score >= 95 && <Sparkles size={12} className="text-medical-cyan animate-pulse" />}
    </div>
  );
}
