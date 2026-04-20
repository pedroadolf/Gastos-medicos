'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle2, ShieldAlert, BadgeInfo } from 'lucide-react';

export default function RegistroRespuestaPage() {
  const [activeTab, setActiveTab] = useState<'aprobada' | 'info' | 'rechazo'>('aprobada');
  const [isUploading, setIsUploading] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  const handleSimulateUpload = () => {
     setIsUploading(true);
     setTimeout(() => {
        setIsUploading(false);
        setIsAutoFilled(true);
     }, 2000); // simulate OCR process
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tighter text-gmm-text uppercase italic">Registrar Respuesta de la Aseguradora</h1>
        <p className="text-[12px] font-bold text-gmm-text-muted mt-2 tracking-wide">
          Cuando MetLife responde a un trámite, captura aquí los datos.
        </p>
      </div>

      {/* Upload Zone (OCR simulation) */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="gmm-card-premium p-8 mb-8 border-dashed border-2 border-gmm-border/50 text-center relative overflow-hidden"
      >
         <div className="flex flex-col items-center justify-center space-y-4 relative z-10">
            <div className="w-16 h-16 rounded-full bg-gmm-accent/10 flex items-center justify-center text-gmm-accent">
               <Upload size={24} />
            </div>
            <div>
               <h3 className="text-sm font-black text-gmm-text uppercase tracking-widest">Extraer datos automáticamente (OCR AI)</h3>
               <p className="text-[10px] font-bold text-gmm-text-muted mt-1 uppercase tracking-widest">
                 Sube el PDF de la carta y nuestro agente extraerá la información
               </p>
            </div>
            <button 
               onClick={handleSimulateUpload}
               disabled={isUploading || isAutoFilled}
               className={`mt-4 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 isAutoFilled 
                   ? 'bg-gmm-success text-white'
                   : 'bg-gmm-accent text-white hover:bg-gmm-text shadow-lg'
               }`}
            >
               {isUploading ? 'Procesando Documento...' : isAutoFilled ? 'Datos Extraídos Exitosamente' : 'Subir PDF de la carta'}
            </button>
            {isAutoFilled && (
               <p className="text-[9px] font-black text-gmm-success uppercase tracking-widest mt-2">Los datos se han reflejado automáticamente en el formulario inferior.</p>
            )}
         </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
         <button onClick={() => setActiveTab('aprobada')} className={`flex items-center gap-2 px-6 py-3 rounded-t-2xl border-b-2 transition-all ${activeTab === 'aprobada' ? 'border-gmm-success text-gmm-success bg-gmm-success/5' : 'border-transparent text-gmm-text-muted hover:bg-gmm-bg'}`}>
            <CheckCircle2 size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Autorización Aprobada</span>
         </button>
         <button onClick={() => setActiveTab('info')} className={`flex items-center gap-2 px-6 py-3 rounded-t-2xl border-b-2 transition-all ${activeTab === 'info' ? 'border-gmm-yellow text-gmm-yellow bg-gmm-yellow/5' : 'border-transparent text-gmm-text-muted hover:bg-gmm-bg'}`}>
            <BadgeInfo size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Solicitud Info. Adicional</span>
         </button>
         <button onClick={() => setActiveTab('rechazo')} className={`flex items-center gap-2 px-6 py-3 rounded-t-2xl border-b-2 transition-all ${activeTab === 'rechazo' ? 'border-gmm-danger text-gmm-danger bg-gmm-danger/5' : 'border-transparent text-gmm-text-muted hover:bg-gmm-bg'}`}>
            <ShieldAlert size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Rechazo</span>
         </button>
      </div>

      {/* Form Data */}
      <motion.div 
         key={activeTab}
         initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
         className="gmm-card-premium p-8"
      >
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="space-y-1">
               <label className="text-[9px] font-bold text-gmm-text-muted uppercase tracking-widest">Asegurado</label>
               <select className="w-full bg-gmm-bg border border-gmm-border/50 text-gmm-text text-[11px] font-black p-3 rounded-xl outline-none focus:border-gmm-accent">
                 <option value="">Seleccionar...</option>
                 <option value="pedro" selected={isAutoFilled}>Pedro A. Soto H.</option>
                 <option value="claudia">Claudia Fonseca</option>
               </select>
            </div>
            <div className="space-y-1">
               <label className="text-[9px] font-bold text-gmm-text-muted uppercase tracking-widest">No. Siniestro</label>
               <input type="text" defaultValue={isAutoFilled ? '3230261780-4' : ''} className="w-full bg-gmm-bg border border-gmm-border/50 text-gmm-text text-[11px] font-black p-3 rounded-xl outline-none focus:border-gmm-accent" placeholder="Ej. 3230261780-4" />
            </div>
            <div className="space-y-1">
               <label className="text-[9px] font-bold text-gmm-text-muted uppercase tracking-widest">Folio DCN</label>
               <input type="text" defaultValue={isAutoFilled ? '20250520MMC' : ''} className="w-full bg-gmm-bg border border-gmm-border/50 text-gmm-text text-[11px] font-black p-3 rounded-xl outline-none focus:border-gmm-accent" placeholder="Depto. Médico" />
            </div>
         </div>

         {activeTab === 'aprobada' && (
           <div className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                   <label className="text-[9px] font-bold text-gmm-text-muted uppercase tracking-widest">Monto Autorizado</label>
                   <input type="number" defaultValue={isAutoFilled ? 18239 : undefined} className="w-full bg-gmm-bg border border-gmm-border/50 text-gmm-text text-[11px] font-black p-3 rounded-xl outline-none focus:border-gmm-accent" placeholder="$0.00" />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-bold text-gmm-text-muted uppercase tracking-widest">Deducible Aplicado</label>
                   <input type="number" defaultValue={isAutoFilled ? 0 : undefined} className="w-full bg-gmm-bg border border-gmm-border/50 text-gmm-text text-[11px] font-black p-3 rounded-xl outline-none focus:border-gmm-accent" placeholder="$0.00" />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-bold text-gmm-text-muted uppercase tracking-widest">Coaseguro (%)</label>
                   <input type="number" defaultValue={isAutoFilled ? 10 : undefined} className="w-full bg-gmm-bg border border-gmm-border/50 text-gmm-text text-[11px] font-black p-3 rounded-xl outline-none focus:border-gmm-accent" placeholder="%" />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-bold text-gmm-text-muted uppercase tracking-widest">Remanente Tope</label>
                   <input type="number" defaultValue={isAutoFilled ? 15676 : undefined} className="w-full bg-gmm-bg border border-gmm-border/50 text-gmm-text text-[11px] font-black p-3 rounded-xl outline-none focus:border-gmm-accent" placeholder="$0.00" />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                   <label className="text-[9px] font-bold text-gmm-text-muted uppercase tracking-widest">Proveedor / Hospital</label>
                   <input type="text" defaultValue={isAutoFilled ? 'Centro Médico ABC' : ''} className="w-full bg-gmm-bg border border-gmm-border/50 text-gmm-text text-[11px] font-black p-3 rounded-xl outline-none focus:border-gmm-accent" />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-bold text-gmm-text-muted uppercase tracking-widest">Diagnóstico CIE</label>
                   <input type="text" defaultValue={isAutoFilled ? 'Diabetes Mellitus - Crónico' : ''} className="w-full bg-gmm-bg border border-gmm-border/50 text-gmm-text text-[11px] font-black p-3 rounded-xl outline-none focus:border-gmm-accent" />
                </div>
             </div>

             <div className="space-y-1">
                <label className="text-[9px] font-bold text-gmm-text-muted uppercase tracking-widest">Medicamentos Autorizados</label>
                <textarea rows={2} defaultValue={isAutoFilled ? 'Jardiance, Atozet, Libre sensor' : ''} className="w-full bg-gmm-bg border border-gmm-border/50 text-gmm-text text-[11px] font-black p-3 rounded-xl outline-none focus:border-gmm-accent" />
             </div>

             <div className="space-y-1">
                <label className="text-[9px] font-bold text-gmm-text-muted uppercase tracking-widest">Observaciones de la carta</label>
                <textarea rows={3} defaultValue={isAutoFilled ? 'Sin deducible por condiciones especiales de póliza. Coaseguro tope de 17,500 MXN.' : ''} className="w-full bg-[#EDF7ED] dark:bg-green-900/20 border border-[#C2E0C6] dark:border-green-800/30 text-green-900 dark:text-green-300 text-[11px] font-black p-3 rounded-xl outline-none focus:border-gmm-accent" />
             </div>
           </div>
         )}

         {activeTab === 'info' && (
           <div className="space-y-6">
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-gmm-text-muted uppercase tracking-widest">Información Requerida por la Aseguradora</label>
                 <textarea rows={4} className="w-full bg-gmm-bg border border-gmm-yellow/50 text-gmm-text text-[11px] font-black p-3 rounded-xl outline-none focus:border-gmm-yellow" placeholder="Detalla qué documentos médicos o administrativos faltan..." />
              </div>
           </div>
         )}

         {activeTab === 'rechazo' && (
           <div className="space-y-6">
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-gmm-text-muted uppercase tracking-widest">Motivo del Rechazo (Cláusula)</label>
                 <textarea rows={4} className="w-full bg-gmm-bg border border-gmm-danger/50 text-gmm-text text-[11px] font-black p-3 rounded-xl outline-none focus:border-gmm-danger" placeholder="Cláusula o motivo exacto del rechazo según la aseguradora..." />
              </div>
           </div>
         )}
      </motion.div>

      <div className="flex justify-end mt-6">
         <button className="px-8 py-3 bg-gmm-text text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2 shadow-lg">
            Guardar y Actualizar {isAutoFilled && 'con Inteligencia Artificial'}
            <FileText size={14} />
         </button>
      </div>

    </div>
  );
}
