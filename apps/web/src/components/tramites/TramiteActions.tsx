import { 
  Eye, 
  Zap, 
  Download, 
  RotateCcw,
  Loader2,
  FileArchive
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export interface Tramite {
  id: string;
  folio: string;
  paciente_nombre: string;
  aseguradora?: string;
  estado: string;
  score?: number;
  zip_url?: string;
}

interface TramiteActionsProps {
  tramite: Tramite;
  onView?: () => void;
  onFix?: () => void;
  onRetry?: () => void;
}

export function TramiteActions({ tramite, onView, onFix, onRetry }: TramiteActionsProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (tramite.zip_url) {
      window.open(tramite.zip_url, "_blank");
      return;
    }

    // Si no hay zip_url, generamos uno nuevo
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/tramites/${tramite.id}/zip`, {
        method: "POST",
      });
      const data = await res.json();
      
      if (data.url) {
        window.open(data.url, "_blank");
      } else {
        alert("Error al generar el expediente: " + (data.error || "Desconocido"));
      }
    } catch (error) {
      console.error("Error generating ZIP:", error);
      alert("Error de conexión al servidor");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <button 
        onClick={(e) => { e.stopPropagation(); onView?.(); }}
        className="p-2 text-slate-400 hover:text-medical-cyan hover:bg-medical-cyan/10 rounded-lg transition-all"
        title="Ver Detalle"
      >
        <Eye size={18} />
      </button>
      
      {(tramite.estado === 'error' || tramite.estado === 'rechazado') && (
        <button 
          onClick={(e) => { e.stopPropagation(); onFix?.(); }}
          className="p-2 text-medical-amber hover:text-white hover:bg-medical-amber/20 rounded-lg transition-all"
          title="Auto-Fix"
        >
          <Zap size={18} fill="currentColor" />
        </button>
      )}

      {(tramite.estado === 'completed' || tramite.estado === 'completado') && (
        <button 
          onClick={handleDownload}
          disabled={isGenerating}
          className={cn(
            "p-2 rounded-lg transition-all flex items-center gap-1",
            tramite.zip_url 
              ? "text-medical-emerald hover:text-white hover:bg-medical-emerald/20" 
              : "text-medical-cyan hover:text-white hover:bg-medical-cyan/20"
          )}
          title={tramite.zip_url ? "Descargar ZIP" : "Generar ZIP"}
        >
          {isGenerating ? (
            <Loader2 size={18} className="animate-spin text-medical-cyan" />
          ) : tramite.zip_url ? (
            <Download size={18} />
          ) : (
            <FileArchive size={18} />
          )}
        </button>
      )}

      {(tramite.estado === 'error' || tramite.estado === 'rechazado') && (
        <button 
          onClick={(e) => { e.stopPropagation(); onRetry?.(); }}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          title="Reintentar"
        >
          <RotateCcw size={18} />
        </button>
      )}
    </div>
  );
}
