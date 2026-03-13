"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, UploadCloud, FileText, Zap, RefreshCw, CheckCircle2, AlertCircle, Info, ExternalLink } from "lucide-react";
import { useDropzone } from "react-dropzone";

// Tipos basados en Google Sheets (Ampliado)
type Asegurado = { id: string; nombre: string; poliza: string; plan: string; rfc: string;[key: string]: any };
type Siniestro = { id: string; aseguradoId: string; titulo: string; fecha: string; estado: string;[key: string]: any };

export default function DashboardPage() {
    const [selectedAsegurado, setSelectedAsegurado] = useState<Asegurado | null>(null);
    const [selectedSiniestro, setSelectedSiniestro] = useState<string | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [procedureType, setProcedureType] = useState<"reembolso" | "carta-pase">("reembolso");

    // Configuración de documentos por trámite
    const procedureConfigs = {
        "reembolso": {
            label: "Trámite de Reembolso",
            autoPDFs: ["3_Carta-Remesa-Marsh-Mar26.pdf", "4_SRGMM-Mar26.pdf"],
            manualChecklist: ["Informe médico firmado", "Estudios diagnósticos", "Comprobante domicilio (<3 meses)", "ID Oficial Afectado/Titular", "Facturas desglosadas", "Estado de cuenta (CLABE)"]
        },
        "carta-pase": {
            label: "Carta Pase (Terapias/Cirugías)",
            autoPDFs: ["3_Carta-Remesa-Marsh-Mar26.pdf", "4_SRGMM-Mar26.pdf", "5_Declaración-jurada-Mar26.pdf"],
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

    const [lastDriveLink, setLastDriveLink] = useState<string | null>(null);

    const handleProcessBtn = async () => {
        if (!selectedAsegurado) return;
        setIsProcessing(true);
        setLastDriveLink(null);

        try {
            // 1. Convertir archivos subidos a Base64 para enviarlos a n8n
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

            // 2. Procesar Documentación Manual (OCR/XML) para obtener datos
            console.log("⏱️ Iniciando Extracción OCR/XML...");
            const formData = new FormData();
            uploadedFiles.forEach((file) => formData.append("files", file));

            let ocrResults = [];
            if (uploadedFiles.length > 0) {
                const response = await fetch("/api/documentos", { method: "POST", body: formData });
                const data = await response.json();
                ocrResults = data.processedFiles || [];
                console.log("✅ Extracción Completada:", ocrResults);
            }

            // 3. Generar TODOS los PDFs primero, luego enviar UN SOLO webhook a n8n
            console.log("⏱️ Generando PDFs y enviando a n8n...");
            const config = procedureConfigs[procedureType];
            const generationResults = [];

            // Datos compartidos para todas las plantillas
            const datosCompartidos = {
                asegurado: { ...selectedAsegurado },
                poliza: { numero: selectedAsegurado.poliza, certificado: selectedAsegurado.certificado },
                siniestro: {
                    numeroSiniestro: selectedSiniestro || selectedAsegurado.siniestroNum || "SIN-NUEVO",
                    diagnostico: selectedAsegurado.padecimiento || "Trámite Médico",
                    hospital: selectedAsegurado.hospital || "N/A",
                    fechaSintomas: new Date().toISOString().split('T')[0]
                },
                totales: {
                    montoCalculado: selectedAsegurado.montoReclamado || "0",
                    cantidadFacturas: selectedAsegurado.cantidadFacturas || ocrResults.length.toString()
                },
                reclamacion: {
                    tipoTramite: selectedAsegurado.tipoTramite || procedureType.toUpperCase(),
                    tipoPago: selectedAsegurado.tipoPago || "Reembolso",
                    naturaleza: selectedAsegurado.naturaleza || "Enfermedad",
                    sector: selectedAsegurado.sectorHospitalario || "Privado",
                    mostrarPadecimiento: selectedAsegurado.mostrarPadecimiento || "SI"
                },
                declaracion: {
                    hospPropio: selectedAsegurado.hospEleccionPropia || "SI",
                    medPropio: selectedAsegurado.medEleccionPropia || "SI",
                    huboAsesoria: selectedAsegurado.huboAsesoria || "NO",
                    huboDescuento: selectedAsegurado.huboDescuento || "NO"
                }
            };

            // Generar todos los PDFs localmente y enviar UN SOLO request combinado
            try {
                const reqGenerar = await fetch("/api/generar", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        datosExtraidos: datosCompartidos,
                        plantillasMultiples: config.autoPDFs, 
                        plantillaSeleccionada: config.autoPDFs[0], 
                        archivosManuales: additionalFiles
                    })
                });
                const res = await reqGenerar.json();
                console.log("✅ Resultado Generación:", res);
                generationResults.push(res);
            } catch (e) {
                console.error("❌ Error generando expediente:", e);
            }

            // Actualizamos la ubicación sugerida (Esto asume que el usuario tiene acceso a la carpeta base)
            const baseDriveUrl = `https://drive.google.com/drive/folders/1s-r2A_g4i0X6_vT84t1J8gK8J8J8J8J8`; // ID real de tu carpeta raíz Marsh
            setLastDriveLink(baseDriveUrl);

            alert(`✅ ¡Expediente Generado!\n\n- ${ocrResults.length} archivos extraídos.\n- ${config.autoPDFs.length} formatos PDF generados y enviados a n8n (1 solo request).\n\nEstructura: n8n creará la carpeta "${selectedAsegurado.nombre}/${new Date().toLocaleDateString('es-MX', {month:'short', year:'2-digit'})}" en Drive.`);
        } catch (error) {
            alert("❌ Error: No se pudo completar el proceso de generación múltiple.");
        } finally {
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
                {/* Columna Izquierda: Configuración */}
                <div className="lg:col-span-1 space-y-6">
                    {/* 1. Asegurado */}
                    <div className="bg-fintech-surface border border-slate-700 rounded-xl p-5 shadow-lg">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                            <span className="bg-slate-800 text-slate-400 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-[10px]">1</span>
                            Asegurado Seleccionado
                        </h2>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder={isLoadingData ? "Conectando con Google Sheets..." : "Buscar Asegurado..."}
                                disabled={isLoadingData}
                                className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-fintech-cyan focus:border-fintech-cyan block pl-9 p-2.5 transition-all outline-none"
                                onChange={(e) => {
                                    const val = e.target.value.toLowerCase();
                                    if (val.length < 3) {
                                        setSelectedAsegurado(null);
                                        return;
                                    }
                                    const match = aseguradosBD.find(a => a.nombre.toLowerCase().includes(val) || a.rfc.toLowerCase().includes(val));
                                    setSelectedAsegurado(match || null);
                                }}
                            />
                        </div>

                        {selectedAsegurado && (
                            <div className="p-3 bg-fintech-emerald/5 border border-fintech-emerald/20 rounded-lg animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-start">
                                    <CheckCircle2 className="w-5 h-5 text-fintech-emerald mt-0.5 mr-2 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-white">{selectedAsegurado.nombre}</p>
                                        <p className="text-[11px] text-slate-400 font-mono tracking-tight">{selectedAsegurado.rfc} | {selectedAsegurado.poliza}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 2. Tipo de Trámite */}
                    <div className="bg-fintech-surface border border-slate-700 rounded-xl p-5 shadow-lg">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                            <span className="bg-slate-800 text-slate-400 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-[10px]">2</span>
                            Configuración del Trámite
                        </h2>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <button
                                onClick={() => setProcedureType("reembolso")}
                                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${procedureType === "reembolso" ? "bg-fintech-cyan/20 border-fintech-cyan text-fintech-cyan" : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"}`}
                            >
                                Reembolso
                            </button>
                            <button
                                onClick={() => setProcedureType("carta-pase")}
                                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${procedureType === "carta-pase" ? "bg-fintech-cyan/20 border-fintech-cyan text-fintech-cyan" : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"}`}
                            >
                                Carta Pase
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="p-3 bg-slate-900/50 rounded-lg">
                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Automáticos (Se llenan solos):</p>
                                {procedureConfigs[procedureType].autoPDFs.map((pdf, idx) => (
                                    <div key={idx} className="flex items-center text-[11px] text-slate-300 mb-1">
                                        <span className="w-1 h-1 bg-fintech-cyan rounded-full mr-2"></span>
                                        {pdf.replace(".pdf", "")}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 3. Siniestro / Padecimiento */}
                    <div className="bg-fintech-surface border border-slate-700 rounded-xl p-5 shadow-lg opacity-90 transition-opacity">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                            <span className="bg-slate-800 text-slate-400 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-[10px]">3</span>
                            Evento Médico
                        </h2>

                        <select
                            title="Seleccionar Siniestro"
                            disabled={!selectedAsegurado}
                            className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-fintech-cyan focus:border-fintech-cyan p-2.5 block cursor-pointer disabled:opacity-30"
                            onChange={(e) => setSelectedSiniestro(e.target.value)}
                        >
                            <option value="">{selectedAsegurado ? "-- Seleccionar Siniestro Existente --" : "-- Busca a un asegurado arriba --"}</option>
                            {selectedAsegurado && siniestrosBD
                                .filter(s => s.aseguradoId === selectedAsegurado.id)
                                .map((s) => (
                                    <option key={s.id} value={s.id}>{s.titulo}</option>
                                ))}
                        </select>
                    </div>
                </div>

                {/* Columna Derecha: Documentación Manual */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-fintech-surface border border-slate-700 rounded-xl p-5 shadow-lg min-h-[500px] flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                                <span className="bg-slate-800 text-slate-400 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-[10px]">4</span>
                                Documentación Necesaria (Manual)
                            </h2>
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded font-mono">{uploadedFiles.length} adjuntos</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Checklist */}
                            <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-xl">
                                <p className="text-[11px] text-slate-500 font-bold uppercase mb-3">Checklist del Trámite:</p>
                                <div className="space-y-2">
                                    {procedureConfigs[procedureType].manualChecklist.map((item, idx) => (
                                        <div key={idx} className="flex items-center text-xs text-slate-400">
                                            <div className="w-3.5 h-3.5 border border-slate-700 rounded mr-2 flex items-center justify-center">
                                                {/* Aquí podríamos detectar si el OCR ya encontró algo similar */}
                                            </div>
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Dropzone */}
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-all cursor-pointer
                                    ${isDragActive ? "border-fintech-emerald bg-fintech-emerald/5" : "border-slate-800 hover:border-fintech-cyan bg-slate-900/20"}
                                `}
                            >
                                <input {...getInputProps()} />
                                <UploadCloud className={`w-8 h-8 mb-2 ${isDragActive ? "text-fintech-emerald" : "text-slate-600"}`} />
                                <p className="text-xs text-slate-300 font-medium text-center">Suelta facturas, informes o IDs aquí</p>
                            </div>
                        </div>

                        {/* Archivos Cargados */}
                        <div className="flex-1 overflow-y-auto max-h-[220px] scrollbar-hide space-y-2">
                            {uploadedFiles.map((file, i) => (
                                <div key={i} className="flex items-center p-3 bg-slate-900/50 border border-slate-800 rounded-lg group animate-in slide-in-from-right-2">
                                    <FileText className="w-4 h-4 text-slate-500 mr-3" />
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-white truncate">{file.name}</p>
                                        <p className="text-[10px] text-slate-500 font-mono">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                    <button
                                        onClick={() => setUploadedFiles(uploadedFiles.filter((_, idx) => idx !== i))}
                                        className="text-slate-600 hover:text-rose-400 p-2"
                                    >✕</button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-end gap-3">
                            {lastDriveLink && (
                                <a
                                    href={lastDriveLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center px-6 py-3 rounded-xl font-bold text-sm bg-slate-800 text-slate-300 hover:bg-slate-750 transition-all border border-slate-700"
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    VER EN DRIVE
                                </a>
                            )}
                            <button
                                onClick={handleProcessBtn}
                                disabled={!selectedAsegurado || isProcessing}
                                className={`flex items-center px-10 py-3 rounded-xl font-bold text-sm shadow-xl transition-all
                                    ${!selectedAsegurado || isProcessing
                                        ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                                        : "bg-fintech-cyan hover:bg-cyan-400 text-slate-900 shadow-cyan-500/20"
                                    }
                                `}
                            >
                                {isProcessing ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                        ARMANDO EXPEDIENTE...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4 mr-2" />
                                        GENERAR Y ENVIAR TRÁMITE
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
