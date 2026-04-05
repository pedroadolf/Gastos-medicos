"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, UploadCloud, FileText, Zap, RefreshCw, CheckCircle2, Loader2, Sparkles, ExternalLink } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";


// Tipos basados en Google Sheets (Ampliado)
type Asegurado = { id: string; nombre: string; poliza: string; plan: string; rfc: string;[key: string]: any };
type Siniestro = { id: string; aseguradoId: string; titulo: string; numeroSiniestro?: string; fecha: string; estado: string;[key: string]: any };

export default function DashboardPage() {
    const [selectedAsegurado, setSelectedAsegurado] = useState<Asegurado | null>(null);
    const [selectedSiniestro, setSelectedSiniestro] = useState<string | null>(null);
    const [anexosFiles, setAnexosFiles] = useState<File[]>([]);
    const [facturasFiles, setFacturasFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [procedureType, setProcedureType] = useState<"reembolso" | "carta-pase">("reembolso");
    const [currentJobId, setCurrentJobId] = useState<string | null>(null);
    const [jobStatus, setJobStatus] = useState<string | null>(null);
    const [fileClassifications, setFileClassifications] = useState<Record<string, string>>({});
    const [lastDriveLink, setLastDriveLink] = useState<string | null>(null);
    // Search dropdown state
    const [searchQuery, setSearchQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    // Cronómetro
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);

    // Efecto del cronómetro
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isProcessing && startTime) {
            interval = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        } else {
            setElapsedTime(0);
        }
        return () => clearInterval(interval);
    }, [isProcessing, startTime]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Configuración de documentos por trámite
    const procedureConfigs = {
        "reembolso": {
            label: "Trámite de Reembolso",
            autoPDFs: ["2_Case_Management-Mar26.pdf", "3_Carta-Remesa-Mar26.pdf", "4_SRGMM-Mar26.pdf"],
            manualChecklist: ["Informe médico firmado", "Estudios diagnósticos", "Comprobante domicilio (<3 meses)", "ID Oficial Afectado/Titular", "Facturas desglosadas", "Estado de cuenta (CLABE)"]
        },
        "carta-pase": {
            label: "Carta Pase (Terapias/Cirugías)",
            autoPDFs: ["2_Case_Management-Mar26.pdf", "3_Carta-Remesa-Mar26.pdf", "4_SRGMM-Mar26.pdf", "5_Declaración-jurada-Mar26.pdf"],
            manualChecklist: ["Informe médico firmado", "Estudios diagnósticos", "Comprobante domicilio (<3 meses)", "ID Oficial Afectado/Titular"]
        }
    };

    // Estado BD (Sheets)
    const [aseguradosBD, setAseguradosBD] = useState<Asegurado[]>([]);
    const [siniestrosBD, setSiniestrosBD] = useState<Siniestro[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Carga de DB al iniciar
    useEffect(() => {
        fetch("/api/afectados")
            .then(res => res.json())
            .then(data => {
                if (data.asegurados) setAseguradosBD(data.asegurados);
                if (data.siniestros) setSiniestrosBD(data.siniestros);
                setIsLoadingData(false);
            })
            .catch(() => setIsLoadingData(false));
    }, []);

    const onDropAnexos = useCallback((acceptedFiles: File[]) => {
        setAnexosFiles((prev) => [...prev, ...acceptedFiles]);
    }, []);

    const onDropFacturas = useCallback((acceptedFiles: File[]) => {
        setFacturasFiles((prev) => [...prev, ...acceptedFiles]);
    }, []);

    const dropzoneAnexos = useDropzone({
        onDrop: onDropAnexos,
        accept: { "application/pdf": [".pdf"], "image/*": [".jpeg", ".png", ".jpg"] },
    });

    const dropzoneFacturas = useDropzone({
        onDrop: onDropFacturas,
        accept: { "application/pdf": [".pdf"], "image/*": [".jpeg", ".png", ".jpg"], "text/xml": [".xml"] },
    });

    // @deprecated as of 2026-04-03 — use handleProcessBtn flow instead (via /api/documentos → n8n)
    // This function is no longer called in the active audit flow. Do NOT remove until v2.0 cleanup.
    const triggerFinalGeneration = async (ocrResults: any[], jobId: string, preReadFiles: any[]) => {
        // Nota: Los archivos se leen en Base64 al inicio del proceso para evitar
        // que el browser invalide los file handles durante procesamiento largo (>2min).
        // Con 15 PDFs esto representa ~6MB en memoria del cliente.
        console.log("⏱️ Generando PDFs finales basado en análisis...");
        setJobStatus("Generando Expediente Final...");
        
        const config = procedureConfigs[procedureType];
        
        // Usamos los archivos pre-leídos al inicio (evita handles expirados)
        const additionalFiles = preReadFiles;

        const datosCompartidos = {
            asegurado: { ...selectedAsegurado },
            poliza: { numero: selectedAsegurado?.poliza, certificado: selectedAsegurado?.certificado },
            siniestro: {
                numeroSiniestro: selectedSiniestro || selectedAsegurado?.siniestroNum || "SIN-NUEVO",
                diagnostico: selectedAsegurado?.padecimiento || "Trámite Médico",
                hospital: selectedAsegurado?.hospital || "N/A",
                fechaSintomas: new Date().toISOString().split('T')[0]
            },
            totales: {
                montoCalculado: selectedAsegurado?.montoReclamado || "0",
                cantidadFacturas: ocrResults.filter(r => r.classification === 'factura_xml').length.toString()
            },
            reclamacion: {
                tipoTramite: selectedAsegurado?.tipoTramite || procedureType.toUpperCase(),
                tipoPago: selectedAsegurado?.tipoPago || "Reembolso",
                naturaleza: selectedAsegurado?.naturaleza || "Enfermedad",
                sector: selectedAsegurado?.sectorHospitalario || "Privado",
                mostrarPadecimiento: selectedAsegurado?.mostrarPadecimiento || "SI"
            },
            declaracion: {
                hospPropio: selectedAsegurado?.hospEleccionPropia || "SI",
                medPropio: selectedAsegurado?.medEleccionPropia || "SI",
                huboAsesoria: selectedAsegurado?.huboAsesoria || "NO",
                huboDescuento: selectedAsegurado?.huboDescuento || "NO"
            }
        };

        const reqGenerar = await fetch("/api/generar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                datosExtraidos: datosCompartidos,
                plantillasMultiples: config.autoPDFs, 
                plantillaSeleccionada: config.autoPDFs[0], 
                archivosManuales: additionalFiles,
                jobId: jobId
            })
        });

        const res = await reqGenerar.json();
        
        if (!res.success) {
            throw new Error(res.error || "Error al enviar la petición a n8n");
        }

        if (!jobId) {
            console.error("❌ Error: No se recibió jobId en triggerFinalGeneration");
            throw new Error("Error interno: Identificador de proceso (jobId) es nulo.");
        }

        const targetJobId = res.jobId || jobId;
        console.log("✅ Petición recibida por n8n, iniciando polling para el JobId:", targetJobId);
        setJobStatus("Procesando trámite final...");

        // Función para consultar estado
        const maxIntentos = 120; // 10 minutos máximo (cada 5s) para procesos pesados de IA
        let n8nResult = null;
        let jobFailed = false;

        for (let i = 0; i < maxIntentos; i++) {
            await new Promise(r => setTimeout(r, 5000));
            const statusRes = await fetch(`/api/gmm-callback?jobId=${targetJobId}`);
            if (!statusRes.ok) continue;

            const data = await statusRes.json();
            
            if (data.status === 'completed') {
                n8nResult = data.result || {};
                break;
            }
            if (data.status === 'failed') {
                jobFailed = true;
                throw new Error(data.error || "El proceso falló en n8n.");
            }
        }

        if (n8nResult === null && !jobFailed) {
            throw new Error('Timeout: el proceso en n8n tardó más de 10 minutos en finalizar. Verifica el workflow en n8n.');
        }

        console.log("✅ Resultado Generación Final:", n8nResult);
        
        // TODO: Ajustar cómo envía n8n la URL de drive, asumimos que devuelve un json en result
        // Si n8nResult es un string (JSON stringificado desde n8n), lo intentamos parsear
        let finalOutput = n8nResult;
        if (typeof n8nResult === 'string') {
            try {
                finalOutput = JSON.parse(n8nResult);
            } catch (e) {
                // ignorar si no es json
            }
        }

        // Solo mostrar botón "VER EN DRIVE" si n8n devuelve un enlace real
        if (finalOutput?.driveUrl || finalOutput?.url) {
            setLastDriveLink(finalOutput.driveUrl || finalOutput.url);
        }
        setIsProcessing(false);

        alert(`✅ ¡Expediente Generado!\n\n- Análisis IA: ${ocrResults.length} archivos procesados.\n- Enviados a n8n exitosamente.`);
    };

    /**
     * Sube un grupo de archivos al server-side API route que usa Service Role
     * para bypasear RLS en Supabase Storage.
     */
    const uploadFilesViaServer = async (
        files: File[], 
        folder: string, 
        group: string
    ): Promise<Array<{ name: string; url: string; path: string }>> => {
        if (files.length === 0) return [];

        const formData = new FormData();
        formData.append("folder", folder);
        formData.append("group", group);
        files.forEach(file => formData.append("files", file));

        const response = await fetch("/api/upload-storage", {
            method: "POST",
            body: formData,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.error || result.details || `Error subiendo ${group}`);
        }

        return result.files;
    };

    const handleProcessBtn = async () => {
        if (!selectedAsegurado || (anexosFiles.length === 0 && facturasFiles.length === 0)) return;
        setIsProcessing(true);
        setStartTime(Date.now());
        setLastDriveLink(null);
        setJobStatus("Preparando archivos...");
        setFileClassifications({});

        try {
            console.log("⏱️ Subiendo archivos a Supabase Storage (via server)...");
            const folderId = `job_${Date.now()}`;
            
            setJobStatus("Subiendo Anexos...");
            const anexosUrls = await uploadFilesViaServer(anexosFiles, folderId, "anexos");
            
            setJobStatus("Subiendo Facturas...");
            const facturasUrls = await uploadFilesViaServer(facturasFiles, folderId, "facturas");

            setJobStatus("Enviando metadatos a n8n...");
            
            const payload = {
                siniestroId: selectedSiniestro || "SIN_NUEVO",
                asegurado: selectedAsegurado,
                tipoTramite: procedureType,
                grupoA_anexos: anexosUrls,
                grupoB_facturas: facturasUrls,
                metadata: {
                    source: "dashboard_v2.0",
                    timestamp: new Date().toISOString()
                }
            };

            const response = await fetch("/api/documentos", { 
                method: "POST", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload) 
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || "Error al iniciar proceso");
            }

            const jobId = result.jobId;
            setCurrentJobId(jobId);
            setJobStatus("IA analizando documentos...");

            // Polling result (simplified version for now, using callback or jobId)
            const maxIntentos = 120;
            for (let i = 0; i < maxIntentos; i++) {
                await new Promise(r => setTimeout(r, 5000));
                const statusRes = await fetch(`/api/gmm-callback?jobId=${jobId}`);
                if (!statusRes.ok) continue;

                const data = await statusRes.json();
                if (data.status === 'completed') {
                    setJobStatus("Completado");
                    if (data.result?.driveUrl) setLastDriveLink(data.result.driveUrl);
                    setIsProcessing(false);
                    return;
                }
                if (data.status === 'failed') {
                    throw new Error(data.error || "El proceso falló.");
                }
            }

        } catch (error: any) {
            console.error("❌ Error en flujo:", error);
            alert(`❌ Error: ${error.message || "No se pudo completar el proceso."}`);
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Nuevo Trámite GMM</h1>
                    <p className="text-slate-400 text-sm">Escanea facturas y genera expedientes inteligentes.</p>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-fintech-emerald animate-pulse"></span>
                    <span className="text-fintech-emerald font-medium">Motor v2.10 Conectado</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-fintech-surface border border-slate-700 rounded-xl p-5 shadow-lg">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                            <span className="bg-slate-800 text-slate-400 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-[10px]">1</span>
                            Asegurado Seleccionado
                        </h2>
                        {/* Buscador con dropdown en tiempo real */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none z-10" />
                            <input
                                id="asegurado-search"
                                name="asegurado-search"
                                type="text"
                                value={searchQuery}
                                placeholder={isLoadingData ? "Conectando con Google Sheets..." : `Buscar por nombre o RFC (${aseguradosBD.length} registros)`}
                                disabled={isLoadingData}
                                autoComplete="off"
                                className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-1 focus:ring-fintech-cyan focus:border-fintech-cyan block pl-9 pr-4 p-2.5 transition-all outline-none"
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowDropdown(e.target.value.length >= 1);
                                    if (e.target.value === "") setSelectedAsegurado(null);
                                }}
                                onFocus={() => searchQuery.length >= 1 && setShowDropdown(true)}
                                onBlur={() => setTimeout(() => setShowDropdown(false), 180)}
                            />
                            {/* Dropdown de resultados */}
                            {showDropdown && (() => {
                                const q = searchQuery.toLowerCase();
                                const matches = aseguradosBD.filter(a =>
                                    a.nombre.toLowerCase().includes(q) ||
                                    (a.rfc || "").toLowerCase().includes(q) ||
                                    (a.empresa || "").toLowerCase().includes(q)
                                );
                                
                                // No deduplicar por RFC para permitir ver múltiples padecimientos de la misma persona
                                const dropdownMatches = matches;

                                return dropdownMatches.length > 0 ? (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl z-50 max-h-56 overflow-y-auto">
                                        {dropdownMatches.map((a, idx) => {
                                            const displayName = a.nombre && a.padecimiento ? `${a.nombre} / ${a.padecimiento}` : a.nombre;
                                            return (
                                                <button
                                                    key={`${a.id}-${a.padecimiento}-${idx}`}
                                                    type="button"
                                                    className="w-full text-left px-4 py-3 hover:bg-slate-700/80 transition-all border-b border-slate-700/50 last:border-0 group"
                                                    onMouseDown={() => {
                                                        setSelectedAsegurado(a);
                                                        setSearchQuery(displayName);
                                                        setShowDropdown(false);
                                                        // Auto-seleccionar siniestro si existe en el registro
                                                        if (a.siniestroNum) {
                                                            const sMatch = siniestrosBD.find(s => s.numeroSiniestro === a.siniestroNum);
                                                            setSelectedSiniestro(sMatch?.id || null);
                                                        } else {
                                                            setSelectedSiniestro(null);
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-white truncate group-hover:text-fintech-cyan transition-colors">
                                                                {a.nombre}
                                                            </p>
                                                            <p className="text-[11px] text-slate-400 font-medium truncate flex items-center mt-0.5">
                                                                <span className="text-fintech-cyan/80 mr-1.5">◆</span>
                                                                {a.padecimiento || "Padecimiento no especificado"}
                                                            </p>
                                                        </div>
                                                        <div className="ml-3 text-right shrink-0">
                                                            <p className="text-[10px] text-slate-500 font-mono">{a.siniestroNum || "Siniestro Nuevo"}</p>
                                                            <p className="text-[9px] text-slate-600 uppercase font-bold tracking-tighter">{a.empresa}</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl z-50 px-3 py-2.5">
                                        <p className="text-xs text-slate-500">Sin resultados para "{searchQuery}"</p>
                                    </div>
                                );
                            })()}
                        </div>

                        {selectedAsegurado && (
                            <div className="p-3 bg-fintech-emerald/5 border border-fintech-emerald/20 rounded-lg">
                                <div className="flex items-start">
                                    <CheckCircle2 className="w-5 h-5 text-fintech-emerald mt-0.5 mr-2 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-white">{selectedAsegurado.nombre}</p>
                                        <p className="text-[11px] text-slate-400 font-mono tracking-tight">{selectedAsegurado.rfc} · {selectedAsegurado.poliza}</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">{selectedAsegurado.padecimiento} · {selectedAsegurado.siniestroNum}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-fintech-surface border border-slate-700 rounded-xl p-5 shadow-lg">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                            <span className="bg-slate-800 text-slate-400 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-[10px]">2</span>
                            Configuración del Trámite
                        </h2>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <button
                                onClick={() => setProcedureType("reembolso")}
                                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${procedureType === "reembolso" ? "bg-fintech-cyan/20 border-fintech-cyan text-fintech-cyan" : "bg-slate-900 border-slate-700 text-slate-400"}`}
                            >Reembolso</button>
                            <button
                                onClick={() => setProcedureType("carta-pase")}
                                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${procedureType === "carta-pase" ? "bg-fintech-cyan/20 border-fintech-cyan text-fintech-cyan" : "bg-slate-900 border-slate-700 text-slate-400"}`}
                            >Carta Pase</button>
                        </div>
                        <div className="p-3 bg-slate-900/50 rounded-lg">
                            <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Automáticos:</p>
                            {procedureConfigs[procedureType].autoPDFs.map((pdf, idx) => (
                                <div key={idx} className="flex items-center text-[11px] text-slate-300 mb-1">
                                    <span className="w-1 h-1 bg-fintech-cyan rounded-full mr-2"></span>
                                    {pdf.replace(".pdf", "")}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-fintech-surface border border-slate-700 rounded-xl p-5 shadow-lg">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                            <span className="bg-slate-800 text-slate-400 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-[10px]">3</span>
                            Evento Médico
                        </h2>
                        <select
                            id="siniestro-selector"
                            name="siniestro-selector"
                            title="Seleccionar Siniestro"
                            disabled={!selectedAsegurado}
                            className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg p-2.5 block disabled:opacity-30"
                            onChange={(e) => {
                                const sId = e.target.value;
                                setSelectedSiniestro(sId);
                                if (!sId) return;
                                
                                const idx = parseInt(sId.split('-').pop() || "");
                                if (!isNaN(idx) && aseguradosBD[idx]) {
                                    setSelectedAsegurado({ ...aseguradosBD[idx] });
                                }
                            }}
                        >
                            <option value="">{selectedAsegurado ? "-- Seleccionar Siniestro --" : "-- Busca asegurado --"}</option>
                            {selectedAsegurado && siniestrosBD
                                .filter(s => s.aseguradoId === selectedAsegurado.id)
                                .map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.titulo} {s.numeroSiniestro ? `(${s.numeroSiniestro})` : ""}
                                    </option>
                                ))}
                        </select>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-fintech-surface border border-slate-700 rounded-xl p-5 shadow-lg min-h-[500px] flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                                <span className="bg-slate-800 text-slate-400 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-[10px]">4</span>
                                Carga de Documentación
                            </h2>
                            <div className="flex gap-4">
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Auditables (XML/PDF)</span>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black bg-fintech-cyan/20 text-fintech-cyan border border-fintech-cyan/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                                        GRUPO B: {facturasFiles.length}
                                    </span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Documentación Soporte</span>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-500 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                                        GRUPO A: {anexosFiles.length}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Dropzones Duales */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div
                                {...dropzoneFacturas.getRootProps()}
                                className={`group relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-all cursor-pointer ${dropzoneFacturas.isDragActive ? "border-fintech-cyan bg-fintech-cyan/10 scale-[1.02]" : "border-slate-800 bg-slate-900/40 hover:border-fintech-cyan/50 hover:bg-slate-900/60"}`}
                            >
                                <div className="absolute top-3 right-3">
                                    <span className="bg-fintech-cyan text-slate-900 text-[8px] font-black px-1.5 py-0.5 rounded shadow-lg uppercase">Obligatorio</span>
                                </div>
                                <input {...dropzoneFacturas.getInputProps()} />
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors ${dropzoneFacturas.isDragActive ? "bg-fintech-cyan text-slate-900" : "bg-slate-800 text-fintech-cyan"}`}>
                                    <Zap className="w-7 h-7" />
                                </div>
                                <p className="text-xs font-black text-white text-center uppercase tracking-widest mb-1">GRUPO B: Facturas</p>
                                <p className="text-[10px] text-slate-400 text-center max-w-[180px]">Sube aquí tus <span className="text-fintech-cyan font-bold">XML</span> y <span className="text-fintech-cyan font-bold">PDF</span> para análisis IA.</p>
                                <p className="mt-4 text-[9px] text-slate-600 font-bold uppercase">Solo archivos fiscales</p>
                            </div>

                            <div
                                {...dropzoneAnexos.getRootProps()}
                                className={`group relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-all cursor-pointer ${dropzoneAnexos.isDragActive ? "border-amber-500 bg-amber-500/10 scale-[1.02]" : "border-slate-800 bg-slate-900/40 hover:border-amber-500/50 hover:bg-slate-900/60"}`}
                            >
                                <div className="absolute top-3 right-3">
                                    <span className="bg-amber-500 text-slate-900 text-[8px] font-black px-1.5 py-0.5 rounded shadow-lg uppercase">Soporte</span>
                                </div>
                                <input {...dropzoneAnexos.getInputProps()} />
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors ${dropzoneAnexos.isDragActive ? "bg-amber-500 text-slate-900" : "bg-slate-800 text-amber-500"}`}>
                                    <UploadCloud className="w-7 h-7" />
                                </div>
                                <p className="text-xs font-black text-white text-center uppercase tracking-widest mb-1">GRUPO A: Anexos</p>
                                <p className="text-[10px] text-slate-400 text-center max-w-[180px]">INE, Informe Médico, <span className="text-amber-500 font-bold">Recetas</span>, Comprobantes de domicilio.</p>
                                <p className="mt-4 text-[9px] text-slate-600 font-bold uppercase">Documentación General</p>
                            </div>
                        </div>

                        {/* Listas de Archivos Separadas */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pr-2 custom-scrollbar overflow-y-auto max-h-[350px]">
                            {/* Columna Grupo B: Facturas */}
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-fintech-cyan uppercase tracking-tighter mb-2 flex justify-between">
                                    <span>📂 Grupo B (Facturas)</span>
                                    <span>{facturasFiles.length} docs</span>
                                </p>
                                {facturasFiles.map((file, i) => (
                                    <div key={`f-${i}`} className="flex items-center p-2.5 bg-fintech-cyan/5 border border-fintech-cyan/20 rounded-lg group hover:border-fintech-cyan/40 transition-colors">
                                        <FileText className="w-4 h-4 mr-2 text-fintech-cyan shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-medium text-white truncate">{file.name}</p>
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setFacturasFiles(facturasFiles.filter((_, idx) => idx !== i)); }} 
                                            className="text-slate-500 hover:text-rose-400 p-1 transition-colors group-hover:scale-110"
                                        >✕</button>
                                    </div>
                                ))}
                                {facturasFiles.length === 0 && (
                                    <div className="py-8 border border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center opacity-40">
                                        <Zap className="w-6 h-6 text-slate-600 mb-1" />
                                        <p className="text-[10px] text-slate-500">Sin facturas</p>
                                    </div>
                                )}
                            </div>

                            {/* Columna Grupo A: Anexos */}
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-tighter mb-2 flex justify-between">
                                    <span>📂 Grupo A (Anexos)</span>
                                    <span>{anexosFiles.length} docs</span>
                                </p>
                                {anexosFiles.map((file, i) => (
                                    <div key={`a-${i}`} className="flex items-center p-2.5 bg-amber-500/5 border border-amber-500/20 rounded-lg group hover:border-amber-500/40 transition-colors">
                                        <UploadCloud className="w-4 h-4 mr-2 text-amber-500 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-medium text-white truncate">{file.name}</p>
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setAnexosFiles(anexosFiles.filter((_, idx) => idx !== i)); }} 
                                            className="text-slate-500 hover:text-rose-400 p-1 transition-colors group-hover:scale-110"
                                        >✕</button>
                                    </div>
                                ))}
                                {anexosFiles.length === 0 && (
                                    <div className="py-8 border border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center opacity-40">
                                        <FileText className="w-6 h-6 text-slate-600 mb-1" />
                                        <p className="text-[10px] text-slate-500">Sin anexos</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Checklist Informativo */}
                        <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-xl mb-6">
                            <p className="text-[11px] text-slate-500 font-bold uppercase mb-3">Checklist del Trámite:</p>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                {procedureConfigs[procedureType].manualChecklist.map((item, idx) => {
                                    const isChecked = Object.values(fileClassifications).some(cls => {
                                        if (item.toLowerCase().includes("id oficial") && cls === "ine") return true;
                                        if (item.toLowerCase().includes("factura") && (cls === "factura_xml" || cls === "posible_factura")) return true;
                                        if (item.toLowerCase().includes("receta") && cls === "receta_medica") return true;
                                        if (item.toLowerCase().includes("informe") && cls === "informe_medico") return true;
                                        if (item.toLowerCase().includes("domicilio") && cls === "comprobante_domicilio") return true;
                                        if (item.toLowerCase().includes("estudio") && cls === "estudios_diagnosticos") return true;
                                        return false;
                                    });

                                    const isJobFinished = jobStatus === "Completado" || (!isProcessing && Object.keys(fileClassifications).length > 0);
                                    const isMissing = isJobFinished && !isChecked;

                                    return (
                                        <div key={idx} className={`flex items-center text-[11px] transition-colors ${isChecked ? "text-fintech-emerald font-bold" : isMissing ? "text-rose-400" : "text-slate-500"}`}>
                                            <div className={`w-3 h-3 border rounded mr-2 flex items-center justify-center transition-all ${isChecked ? "bg-fintech-emerald border-fintech-emerald" : isMissing ? "bg-rose-500/20 border-rose-500" : "border-slate-700"}`}>
                                                {isChecked ? (
                                                    <CheckCircle2 className="w-2 h-2 text-white" />
                                                ) : isMissing ? (
                                                    <span className="text-[8px] font-bold leading-none">✕</span>
                                                ) : null}
                                            </div>
                                            <span className="truncate">{item}</span>
                                            {isChecked && <Sparkles className="w-2.5 h-2.5 ml-2 text-fintech-cyan animate-pulse flex-shrink-0" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Acciones Finales */}
                        <div className="pt-5 border-t border-slate-800/80 flex flex-col space-y-4">
                            {/* Validation Messages */}
                            {!selectedAsegurado && (anexosFiles.length > 0 || facturasFiles.length > 0) && (
                                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center animate-pulse">
                                    <Sparkles className="w-4 h-4 text-amber-500 mr-2 shrink-0" />
                                    <p className="text-[11px] font-bold text-amber-200">
                                        PASO FALTANTE: Selecciona un asegurado en la sección 1 para habilitar el envío.
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-3">
                                {lastDriveLink && (
                                    <a href={lastDriveLink} target="_blank" rel="noopener noreferrer" className="flex items-center px-6 py-3 rounded-xl font-bold text-sm bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all">
                                        <ExternalLink className="w-4 h-4 mr-2" /> VER EN DRIVE
                                    </a>
                                )}
                                <button
                                    onClick={handleProcessBtn}
                                    disabled={!selectedAsegurado || isProcessing || (anexosFiles.length === 0 && facturasFiles.length === 0)}
                                    className={cn(
                                        "flex flex-col items-center justify-center px-10 py-4 rounded-2xl font-black text-sm shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-300 relative overflow-hidden group",
                                        !selectedAsegurado || isProcessing || (anexosFiles.length === 0 && facturasFiles.length === 0)
                                            ? "bg-slate-800 text-slate-600 cursor-not-allowed border border-white/5"
                                            : "bg-gradient-to-tr from-fintech-emerald via-emerald-400 to-teal-400 text-slate-900 hover:scale-[1.02] active:scale-95 shadow-emerald-500/20 hover:shadow-emerald-500/40"
                                    )}
                                >
                                    {/* Effect for ready state */}
                                    {selectedAsegurado && !isProcessing && (anexosFiles.length > 0 || facturasFiles.length > 0) && (
                                        <div className="absolute inset-0 bg-white/20 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
                                    )}
                                    
                                    <div className="flex items-center relative z-10">
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="w-6 h-6 mr-3 animate-spin text-slate-900" />
                                                <div className="flex flex-col items-start leading-none">
                                                    <span className="text-[10px] uppercase tracking-widest font-black opacity-60">PROCESANDO EXPEDIENTE</span>
                                                    <span className="text-xl font-black">{formatTime(elapsedTime)}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="w-5 h-5 mr-3 fill-current group-hover:scale-125 transition-transform" />
                                                <div className="flex flex-col items-start text-left">
                                                    <span className="text-[10px] uppercase tracking-[0.2em] font-black opacity-70">LISTO PARA ENVIAR</span>
                                                    <span className="text-sm font-black whitespace-nowrap">GENERAR Y PROCESAR TRÁMITE</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    
                                    {isProcessing && (
                                        <div className="flex flex-col items-center mt-2 text-[10px] uppercase font-bold text-slate-900/60 leading-none">
                                            <span className="bg-slate-900/10 px-2 py-0.5 rounded-full">{jobStatus || "Iniciando..."}</span>
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
