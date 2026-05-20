'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, FileText, CheckCircle2, ShieldAlert, 
  BadgeInfo, ArrowRight, Wallet, Check, AlertCircle, RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface ExtractedData {
  insuredKey: string;
  insuredName: string;
  claimNum: string;
  folioDcn: string;
  amount: number;
  deducible: number;
  coaseguro: number;
  diagnosis: string;
  provider: string;
  date: string;
  observations: string;
}

export default function RegistroRespuestaPage() {
  const [activeTab, setActiveTab] = useState<'aprobada' | 'info' | 'rechazo'>('aprobada');
  const [isUploading, setIsUploading] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [uploadSource, setUploadSource] = useState<'upload' | 'local' | null>(null);

  // Form states
  const [insuredKey, setInsuredKey] = useState('sebastian-soto');
  const [claimNum, setClaimNum] = useState('');
  const [folioDcn, setFolioDcn] = useState('');
  const [amount, setAmount] = useState(0);
  const [deducible, setDeducible] = useState(0);
  const [coaseguro, setCoaseguro] = useState(0);
  const [provider, setProvider] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [observations, setObservations] = useState('');

  // Siniestros stats before reconciliation (Sebastián Soto base state)
  const basePaidSebas = 451554.22;
  const basePendingSebas = 27053.00;
  const basePolicyLimit = 3554258.38;
  const baseTotalPaidGroup = 1348851.68;
  const baseTotalPendingGroup = 72508.36;

  // Handle standard PDF file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setUploadSource('upload');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/ocr-pdf', {
        method: 'POST',
        body: formData
      });
      const result = await res.json();

      if (result.success && result.data) {
        fillForm(result.data);
        setIsAutoFilled(true);
      } else {
        setErrorMsg(result.error || 'Error al procesar el PDF');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('No se pudo establecer conexión con el motor OCR.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle local filesystem PDF simulation (GET request to read path)
  const handleLoadLocalFile = async () => {
    setIsUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setUploadSource('local');

    try {
      const res = await fetch('/api/ocr-pdf?loadLocal=true');
      const result = await res.json();

      if (result.success && result.data) {
        fillForm(result.data);
        setIsAutoFilled(true);
      } else {
        setErrorMsg(result.error || 'No se pudo encontrar el archivo finiquito.PDF local');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Error al conectar con la API de conciliación local.');
    } finally {
      setIsUploading(false);
    }
  };

  // Helper to populate form fields
  const fillForm = (data: ExtractedData) => {
    setInsuredKey(data.insuredKey);
    setClaimNum(data.claimNum);
    setFolioDcn(data.folioDcn);
    setAmount(data.amount);
    setDeducible(data.deducible);
    setCoaseguro(data.coaseguro);
    setProvider(data.provider);
    setDiagnosis(data.diagnosis);
    setObservations(data.observations);
  };

  // Reset form
  const handleReset = () => {
    setInsuredKey('sebastian-soto');
    setClaimNum('');
    setFolioDcn('');
    setAmount(0);
    setDeducible(0);
    setCoaseguro(0);
    setProvider('');
    setDiagnosis('');
    setObservations('');
    setIsAutoFilled(false);
    setUploadSource(null);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  // Save reconciliation to localStorage
  const handleSave = () => {
    if (!claimNum || amount <= 0) {
      setErrorMsg('Por favor completa los campos obligatorios: No. Siniestro e Importe Autorizado.');
      return;
    }

    try {
      const saved = localStorage.getItem('gmm-conciliaciones');
      const conciliaciones = saved ? JSON.parse(saved) : [];

      const newConciliacion = {
        id: `c_${Date.now()}`,
        insuredKey,
        claimNum,
        folioDcn,
        amount,
        deducible,
        coaseguro,
        diagnosis,
        provider,
        observations,
        date: new Date().toISOString().split('T')[0]
      };

      // Append and save
      conciliaciones.push(newConciliacion);
      localStorage.setItem('gmm-conciliaciones', JSON.stringify(conciliaciones));

      setSuccessMsg('¡Finiquito conciliado con éxito! Los subtotales de asegurados y los gráficos financieros del Dashboard se han actualizado.');
      
      // Auto scroll to success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.error(e);
      setErrorMsg('No se pudo guardar la conciliación localmente.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      
      {/* ── HEADER ── */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-black tracking-tighter text-slate-900 dark:text-white uppercase italic leading-none">
            Conciliación de Liquidaciones (Finiquito)
          </h1>
          <p className="text-[11px] font-bold text-gmm-text-muted mt-2 tracking-wide uppercase">
            Sube el finiquito de MetLife para conciliar los trámites del grupo familiar
          </p>
        </div>
        <Link 
          href="/dashboard" 
          className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-[#FFAA00] transition-colors self-start md:self-auto flex items-center gap-1.5"
        >
          Volver al Dashboard <ArrowRight size={14} />
        </Link>
      </div>

      {/* ── NOTIFICATIONS ── */}
      {errorMsg && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold mb-6 flex items-start gap-3"
        >
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-black uppercase tracking-wider">Error de Procesamiento</p>
            <p className="mt-1">{errorMsg}</p>
          </div>
        </motion.div>
      )}

      {successMsg && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-6 flex items-start gap-4"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
            <Check size={18} strokeWidth={3} />
          </div>
          <div>
            <p className="font-black uppercase tracking-wider text-[13px]">Conciliación Exitosa</p>
            <p className="mt-1 text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{successMsg}</p>
            <div className="mt-4 flex gap-4">
              <Link 
                href="/dashboard" 
                className="px-4 py-2 bg-[#FFAA00] hover:bg-[#E09500] text-slate-950 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors shadow-lg shadow-amber-500/20"
              >
                Ir a Ver Dashboard
              </Link>
              <button 
                onClick={handleReset} 
                className="px-4 py-2 border border-slate-300 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors"
              >
                Conciliar Otro Documento
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── DRAG & DROP / SIMULATION AREA ── */}
      {!successMsg && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="gmm-box p-8 mb-8 text-center relative overflow-hidden border-dashed border-2 border-slate-300 dark:border-white/10"
        >
          <div className="absolute right-0 top-0 bottom-0 w-48 bg-gmm-accent/5 blur-3xl pointer-events-none" />
          
          <div className="flex flex-col items-center justify-center space-y-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-[#FFAA00]/10 border border-[#FFAA00]/20 flex items-center justify-center text-[#FFAA00] shadow-inner">
              <Upload size={24} />
            </div>
            
            <div>
              <h3 className="text-[13px] font-black text-slate-800 dark:text-white uppercase tracking-widest">
                Extraer datos del Finiquito (AI OCR)
              </h3>
              <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">
                Sube el PDF de MetLife o simula el proceso con el archivo real del sistema
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
              {/* Actual file upload */}
              <label className="px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:opacity-90 flex items-center gap-2 shadow-lg">
                <FileText size={14} />
                Seleccionar PDF
                <input 
                  type="file" 
                  accept="application/pdf" 
                  className="hidden" 
                  onChange={handleFileUpload} 
                  disabled={isUploading}
                />
              </label>

              {/* Local file simulation button */}
              <button 
                onClick={handleLoadLocalFile}
                disabled={isUploading}
                className="px-6 py-3 border border-slate-300 dark:border-white/10 hover:border-amber-500/50 hover:bg-amber-500/5 text-slate-700 dark:text-slate-300 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
              >
                {isUploading && uploadSource === 'local' ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Wallet size={14} />
                )}
                Simular con finiquito.PDF real
              </button>
            </div>

            {isUploading && (
              <p className="text-[9px] font-black text-[#FFAA00] uppercase tracking-widest animate-pulse mt-4">
                Procesando documento con motor parser (pdfreader) ...
              </p>
            )}

            {isAutoFilled && !isUploading && (
              <div className="pt-2">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black uppercase rounded-full tracking-widest">
                  Lectura OCR Exitosa
                </span>
                <p className="text-[9px] font-bold text-slate-400 mt-2">
                  Los datos leídos del archivo se han precargado en los campos inferiores.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── REAL-TIME FINANCIAL IMPACT PREVIEW ── */}
      <AnimatePresence>
        {isAutoFilled && !successMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <div className="gmm-box p-6 bg-slate-50 dark:bg-slate-900/30 border-emerald-500/20">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FFAA00] mb-4">
                Proyección de Impacto Financiero (Simulado)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Sebastián Soto Subtotal */}
                <div className="space-y-2 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5">
                  <p className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Pago Acumulado Paciente</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Pedro Sebastián Soto Fonseca</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-bold text-slate-400">${basePaidSebas.toLocaleString('es-MX')}</span>
                    <ArrowRight size={12} className="text-slate-400" />
                    <span className="text-sm font-black text-emerald-500">${(basePaidSebas + amount).toLocaleString('es-MX')}</span>
                  </div>
                  <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Impacto: +${amount.toLocaleString('es-MX')}</p>
                </div>

                {/* 2. Pending claim balance reduced */}
                <div className="space-y-2 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5">
                  <p className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Trámites en Proceso (Pendiente)</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Conciliación de Reclamación</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-bold text-slate-400">${basePendingSebas.toLocaleString('es-MX')}</span>
                    <ArrowRight size={12} className="text-slate-400" />
                    <span className="text-sm font-black text-amber-500">${Math.max(0, basePendingSebas - amount).toLocaleString('es-MX')}</span>
                  </div>
                  <p className="text-[8px] font-bold text-amber-500 uppercase tracking-widest mt-1">
                    Reducción: -${Math.min(basePendingSebas, amount).toLocaleString('es-MX')}
                  </p>
                </div>

                {/* 3. Available policy budget */}
                <div className="space-y-2 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5">
                  <p className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Presupuesto Póliza Disponible</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Límite: ${basePolicyLimit.toLocaleString('es-MX')}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-bold text-slate-400">
                      ${(basePolicyLimit - baseTotalPaidGroup - baseTotalPendingGroup).toLocaleString('es-MX')}
                    </span>
                    <ArrowRight size={12} className="text-slate-400" />
                    <span className="text-sm font-black text-blue-500">
                      ${(basePolicyLimit - (baseTotalPaidGroup + amount) - Math.max(0, baseTotalPendingGroup - amount)).toLocaleString('es-MX')}
                    </span>
                  </div>
                  <p className="text-[8px] font-bold text-blue-500 uppercase tracking-widest mt-1">Saldo reajustado por conciliación</p>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TABS FOR TYPE OF RESPONSE ── */}
      {!successMsg && (
        <>
          <div className="flex gap-1 border-b border-slate-200 dark:border-white/10 mb-6 overflow-x-auto scrollbar-none">
            <button 
              onClick={() => setActiveTab('aprobada')} 
              className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl border-b-2 transition-all whitespace-nowrap outline-none ${
                activeTab === 'aprobada' 
                  ? 'border-emerald-500 text-emerald-500 bg-emerald-500/5 font-black' 
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 font-bold'
              }`}
            >
              <CheckCircle2 size={15} />
              <span className="text-[10px] uppercase tracking-widest">Pago Aprobado (Finiquito)</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('info')} 
              className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl border-b-2 transition-all whitespace-nowrap outline-none ${
                activeTab === 'info' 
                  ? 'border-amber-500 text-amber-500 bg-amber-500/5 font-black' 
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 font-bold'
              }`}
            >
              <BadgeInfo size={15} />
              <span className="text-[10px] uppercase tracking-widest">Información Adicional</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('rechazo')} 
              className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl border-b-2 transition-all whitespace-nowrap outline-none ${
                activeTab === 'rechazo' 
                  ? 'border-rose-500 text-rose-500 bg-rose-500/5 font-black' 
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 font-bold'
              }`}
            >
              <ShieldAlert size={15} />
              <span className="text-[10px] uppercase tracking-widest">Rechazo de Trámite</span>
            </button>
          </div>

          {/* ── FORM CONTAINER ── */}
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            className="gmm-box p-8"
          >
            {/* Core Claim Identification */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Asegurado Afectado *</label>
                <select 
                  value={insuredKey}
                  onChange={(e) => setInsuredKey(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-[11px] font-black p-3 rounded-xl outline-none focus:border-amber-500"
                >
                  <option value="claudia-fonseca">Claudia Fonseca Aguilar (Titular)</option>
                  <option value="pedro-soto">Pedro Adolfo Soto Hernández (Cónyuge)</option>
                  <option value="emilio-soto">Emilio Soto Fonseca (Hijo)</option>
                  <option value="sebastian-soto">Pedro Sebastián Soto Fonseca (Hijo)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">No. Siniestro / Reclamación *</label>
                <input 
                  type="text" 
                  value={claimNum}
                  onChange={(e) => setClaimNum(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-[11px] font-black p-3 rounded-xl outline-none focus:border-amber-500" 
                  placeholder="Ej. 01-260229762-006" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Folio DCN / Referencia</label>
                <input 
                  type="text" 
                  value={folioDcn}
                  onChange={(e) => setFolioDcn(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-[11px] font-black p-3 rounded-xl outline-none focus:border-amber-500" 
                  placeholder="Ej. 20260512MMC..." 
                />
              </div>

            </div>

            {/* Approved Tab Fields */}
            {activeTab === 'aprobada' && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Monto Autorizado (Pagado) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-[11px] font-black text-slate-400">$</span>
                      <input 
                        type="number" 
                        value={amount || ''}
                        onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-[11px] font-black pl-6 pr-3 p-3 rounded-xl outline-none focus:border-amber-500" 
                        placeholder="0.00" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Deducible Aplicado</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-[11px] font-black text-slate-400">$</span>
                      <input 
                        type="number" 
                        value={deducible || ''}
                        onChange={(e) => setDeducible(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-[11px] font-black pl-6 pr-3 p-3 rounded-xl outline-none focus:border-amber-500" 
                        placeholder="0.00" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Coaseguro Aplicado</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-[11px] font-black text-slate-400">$</span>
                      <input 
                        type="number" 
                        value={coaseguro || ''}
                        onChange={(e) => setCoaseguro(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-[11px] font-black pl-6 pr-3 p-3 rounded-xl outline-none focus:border-amber-500" 
                        placeholder="0.00" 
                      />
                    </div>
                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Proveedor / Concepto</label>
                    <input 
                      type="text" 
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-[11px] font-black p-3 rounded-xl outline-none focus:border-amber-500" 
                      placeholder="Ej. Estudios de Gabinete, Farmacia, Hospital..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Diagnóstico (Padecimiento)</label>
                    <input 
                      type="text" 
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-[11px] font-black p-3 rounded-xl outline-none focus:border-amber-500" 
                      placeholder="Ej. Lesión Ligamento Cruzado Rodilla..."
                    />
                  </div>

                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Observaciones / Desglose del Finiquito</label>
                  <textarea 
                    rows={4} 
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-[11px] font-bold p-3 rounded-xl outline-none focus:border-amber-500" 
                    placeholder="Escribe comentarios o aclaraciones de la liquidación de MetLife..."
                  />
                </div>
              </div>
            )}

            {/* Info Required Tab */}
            {activeTab === 'info' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black">Información médica o administrativa requerida</label>
                  <textarea 
                    rows={4} 
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-[11px] font-bold p-3 rounded-xl outline-none focus:border-amber-500" 
                    placeholder="Detalla qué documentos médicos o aclaraciones solicita MetLife (ej. informe médico actualizado, desglose de facturas)..." 
                  />
                </div>
              </div>
            )}

            {/* Rejected Tab */}
            {activeTab === 'rechazo' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black">Motivo del rechazo de la Aseguradora</label>
                  <textarea 
                    rows={4} 
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-[11px] font-bold p-3 rounded-xl outline-none focus:border-amber-500" 
                    placeholder="Cláusula aplicable o motivo detallado del rechazo según el dictamen médico de la aseguradora..." 
                  />
                </div>
              </div>
            )}
          </motion.div>

          {/* ── ACTION FOOTER ── */}
          <div className="flex justify-between items-center mt-6">
            <button 
              onClick={handleReset}
              className="px-6 py-3 border border-slate-300 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Limpiar Campos
            </button>
            <button 
              onClick={handleSave}
              className="px-8 py-3 bg-[#FFAA00] hover:bg-[#E09500] text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest transition-transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-amber-500/10"
            >
              Guardar y Conciliar Pago
              <FileText size={14} />
            </button>
          </div>
        </>
      )}

    </div>
  );
}
