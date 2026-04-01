"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, UploadCloud, FileText, Zap, RefreshCw, CheckCircle2, Loader2, Sparkles, ExternalLink } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/lib/supabase";

// Tipos basados en Google Sheets (Ampliado)
type Asegurado = { id: string; nombre: string; poliza: string; plan: string; rfc: string;[key: string]: any };
type Siniestro = { id: string; aseguradoId: string; titulo: string; numeroSiniestro?: string; fecha: string; estado: string;[key: string]: any };

export default function DashboardPage() {
    const [selectedAsegurado, setSelectedAsegurado] = useState<Asegurado | null>(null);
    const [selectedSiniestro, setSelectedSiniestro] = useState<string | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
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
            autoPDFs: ["3_Carta-Remesa-Mar26.pdf", "4_SRGMM-Mar26.pdf"],
            manualChecklist: ["Informe médico firmado", "Estudios diagnósticos", "Comprobante domicilio (<3 meses)", "ID Oficial Afectado/Titular", "Facturas desglosadas", "Estado de cuenta (CLABE)"]
        },
        "carta-pase": {
            label: "Carta Pase (Terapias/Cirugías)",
            autoPDFs: ["3_Carta-Remesa-Mar26.pdf", "4_SRGMM-Mar26.pdf", "5_Declaración-jurada-Mar26.pdf"],
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

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setUploadedFiles((prev) => [...prev, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "application/pdf": [".pdf"], "image/*": [".jpeg", ".png", ".jpg"], "text/xml": [".xml"] },
    });

    const triggerFinalGeneration = async (ocrResults: any[], jobId: string) => {
        console.log("⏱️ Generando PDFs finales basado en análisis...");
        setJobStatus("Generando Expediente Final...");
        
        const config = procedureConfigs[procedureType];
        
        // Convertir archivos para el paso final
        const filePromises = uploadedFiles.map(file => {
            return new Promise<{ name: string, base64: string, type: string }>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64 = (reader.result as string).split(',')[1];
                    resolve({ name: file.name, base64, type: file.type });
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });
        const additionalFiles = await Promise.all(filePromises);

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

        alert(`✅ ¡Expediente Generado!\n\n- Análisis IA: ${ocrResults.length} archivos procesados.\n- Enviados a n8n exitosamente.\n\nEstructura: n8n creó la carpeta "${selectedAsegurado?.nombre}" en Drive.`);
    };

    const handleProcessBtn = async () => {
        if (!selectedAsegurado || uploadedFiles.length === 0) return;
        setIsProcessing(true);
        setStartTime(Date.now());
        setLastDriveLink(null);
        setJobStatus("Enviando archivos...");
        setFileClassifications({});

        try {
            console.log("⏱️ Iniciando Job de Procesamiento...");
            const formData = new FormData();
            uploadedFiles.forEach((file) => formData.append("files", file));
            
            formData.append("metadata", JSON.stringify({
                asegurado: selectedAsegurado.nombre,
                tipo_tramite: procedureType
            }));

            const response = await fetch("/api/documentos", { method: "POST", body: formData });
            const initialData = await response.json();
            
            if (!initialData.jobId) {
                const detailMsg = initialData.details ? `\n\nDetalle: ${initialData.details}\nCódigo: ${initialData.code}\nTarget: ${initialData.target}` : "";
                throw new Error("No se pudo crear el Job de procesamiento." + detailMsg);
            }

            const jobId = initialData.jobId;
            setCurrentJobId(jobId);
            setJobStatus("IA analizando documentos...");

            // Escuchar cambios en Supabase Realtime
            const channel = supabase
                .channel(`job-updates-${jobId}`)
                .on(
                    'postgres_changes',
                    { event: 'UPDATE', schema: 'public', table: 'jobs', filter: `id=eq.${jobId}` },
                    async (payload: any) => {
                        const updatedJob = payload.new;
                        console.log("🔄 Job Update:", updatedJob);
                        
                        if (updatedJob.results && Object.keys(fileClassifications).length === 0) {
                            const newClassifications: Record<string, string> = {};
                            const resultsArray2 = Array.isArray(updatedJob.results) 
                                ? updatedJob.results 
                                : Object.values(updatedJob.results || {});
                            
                            resultsArray2.forEach((res: any) => {
                                if (res.classification) {
                                    newClassifications[res.fileName] = res.classification;
                                }
                            });
                            setFileClassifications(newClassifications);
                        }

                        if (updatedJob.status === 'completed') {
                            setJobStatus("Completado");
                            console.log("🚀 Job finalizado. Iniciando RE-FETCH de seguridad...");
                            
                            // 🚀 RE-FETCH DE SEGURIDAD: Los payloads de Realtime pueden truncar JSONs grandes
                            const { data: fullJob, error: fetchError } = await supabase
                                .from('jobs')
                                .select('*')
                                .eq('id', jobId)
                                .single();

                            if (fetchError || !fullJob) {
                                console.error("❌ Error re-fetching job details:", fetchError);
                                alert("Error recuperando resultados del análisis de base de datos.");
                                setIsProcessing(false);
                                return;
                            }

                            const finalResults = Array.isArray(fullJob.results) 
                                ? fullJob.results 
                                : Object.values(fullJob.results || {});

                            console.log("📦 Datos completos recuperados:", finalResults.length, "registros.");

                            if (finalResults.length > 0) {
                                const finalClassifications: Record<string, string> = {};
                                
                                finalResults.forEach((res: any) => {
                                    if (res.classification) {
                                        finalClassifications[res.fileName] = res.classification;
                                    }
                                });
                                setFileClassifications(finalClassifications);
                            }

                            // 🔑 Usamos el jobId de la sesión (closure) para evitar problemas de payload truncado
                            await triggerFinalGeneration(finalResults, jobId);
                        } else if (updatedJob.status === 'failed') {
                            setJobStatus("Error");
                             alert("❌ Error en Worker: " + (updatedJob.error_message || "Desconocido"));
                            supabase.removeChannel(channel);
                            setIsProcessing(false);
                        }
                    }
                )
                .subscribe();

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
                                
                                // Deduplicar por ID (RFC) para que la persona solo salga una vez
                                const uniqueMatches = matches.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

                                return uniqueMatches.length > 0 ? (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl z-50 max-h-56 overflow-y-auto">
                                        {uniqueMatches.map((a) => (
                                            <button
                                                key={a.id}
                                                type="button"
                                                className="w-full text-left px-3 py-2.5 hover:bg-slate-700 transition-colors border-b border-slate-700/50 last:border-0"
                                                onMouseDown={() => {
                                                    setSelectedAsegurado(a);
                                                    setSearchQuery(a.nombre);
                                                    setShowDropdown(false);
                                                    setSelectedSiniestro(null);
                                                }}
                                            >
                                                <p className="text-sm font-semibold text-white truncate">{a.nombre}</p>
                                                <p className="text-[10px] text-slate-400 font-mono">{a.rfc} · {a.empresa}</p>
                                            </button>
                                        ))}
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
                                Documentación Manual
                            </h2>
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded font-mono">{uploadedFiles.length} adjuntos</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-xl">
                                <p className="text-[11px] text-slate-500 font-bold uppercase mb-3">Checklist del Trámite:</p>
                                <div className="space-y-2">
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
                                            <div key={idx} className={`flex items-center text-xs transition-colors ${isChecked ? "text-fintech-emerald font-bold" : isMissing ? "text-rose-400" : "text-slate-400"}`}>
                                                <div className={`w-3.5 h-3.5 border rounded mr-2 flex items-center justify-center transition-all ${isChecked ? "bg-fintech-emerald border-fintech-emerald" : isMissing ? "bg-rose-500/20 border-rose-500" : "border-slate-700"}`}>
                                                    {isChecked ? (
                                                        <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                                                    ) : isMissing ? (
                                                        <span className="text-[10px] font-bold leading-none">✕</span>
                                                    ) : null}
                                                </div>
                                                {item}
                                                {isChecked && <Sparkles className="w-2.5 h-2.5 ml-2 text-fintech-cyan animate-pulse" />}
                                                {isMissing && <span className="ml-2 text-[9px] font-bold uppercase tracking-tighter opacity-70">No detectado</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-all cursor-pointer ${isDragActive ? "border-fintech-emerald bg-fintech-emerald/5" : "border-slate-800 hover:border-fintech-cyan bg-slate-900/20"}`}
                            >
                                <input {...getInputProps()} />
                                <UploadCloud className={`w-8 h-8 mb-2 ${isDragActive ? "text-fintech-emerald" : "text-slate-600"}`} />
                                <p className="text-xs text-slate-300 font-medium text-center">Suelta facturas, informes o IDs aquí</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-[220px] space-y-2 mb-6">
                            {uploadedFiles.map((file, i) => {
                                const classification = fileClassifications[file.name];
                                return (
                                    <div key={i} className="flex items-center p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                                        {isProcessing && !classification ? (
                                            <Loader2 className="w-4 h-4 text-fintech-cyan mr-3 animate-spin" />
                                        ) : (
                                            <FileText className={`w-4 h-4 mr-3 ${classification ? "text-fintech-emerald" : "text-slate-500"}`} />
                                        )}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-medium text-white truncate">{file.name}</p>
                                                {classification && (
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold ${
                                                        classification === "desconocido" 
                                                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30" 
                                                            : "bg-fintech-emerald/10 text-fintech-emerald border-fintech-emerald/30"
                                                    }`}>
                                                        {classification === "ine" ? "ID Oficial (INE)" 
                                                         : classification === "factura_xml" ? "Factura XML" 
                                                         : classification === "receta_medica" ? "Receta Médica"
                                                         : classification === "informe_medico" ? "Informe Médico"
                                                         : classification === "comprobante_domicilio" ? "Comp. Domicilio"
                                                         : classification === "estudios_diagnosticos" ? "Estudios Dx"
                                                         : classification === "posible_factura" ? "Posible Factura"
                                                         : classification.replace("_", " ")}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button onClick={() => setUploadedFiles(uploadedFiles.filter((_, idx) => idx !== i))} className="text-slate-600 hover:text-rose-400 p-2">✕</button>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="pt-5 border-t border-slate-800/80 flex items-center justify-end gap-3">
                            {lastDriveLink && (
                                <a href={lastDriveLink} target="_blank" rel="noopener noreferrer" className="flex items-center px-6 py-3 rounded-xl font-bold text-sm bg-slate-800 text-slate-300 border border-slate-700">
                                    <ExternalLink className="w-4 h-4 mr-2" /> VER EN DRIVE
                                </a>
                            )}
                            <button
                                onClick={handleProcessBtn}
                                disabled={!selectedAsegurado || isProcessing || uploadedFiles.length === 0}
                                className={`flex flex-col items-center justify-center px-10 py-3 rounded-xl font-bold text-sm shadow-xl transition-all ${!selectedAsegurado || isProcessing || uploadedFiles.length === 0 ? "bg-slate-800 text-slate-600 cursor-not-allowed" : "bg-fintech-cyan hover:bg-cyan-400 text-slate-900"}`}
                            >
                                <div className="flex items-center">
                                    {isProcessing ? (
                                        <>
                                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                            {jobStatus || "PROCESANDO..."}
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-4 h-4 mr-2" />
                                            GENERAR Y ENVIAR TRÁMITE
                                        </>
                                    )}
                                </div>
                                {isProcessing && (
                                    <div className="flex flex-col items-center mt-1 text-[10px] opacity-80 font-mono">
                                        <span>Tiempo transcurrido: {formatTime(elapsedTime)}</span>
                                        {currentJobId && <span className="mt-0.5 tracking-tighter">ID: {currentJobId.split('-')[0]}...</span>}
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
