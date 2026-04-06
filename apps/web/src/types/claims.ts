// 🚑 TypeScript Definitions for Core Claims (Siniestros)

export type TramiteType = 'reembolso' | 'programacion' | 'carta_pase';
export type TramiteStatus = 'borrador' | 'en_revision' | 'procesando' | 'completado' | 'rechazado';
export type FacturaTipo = 'H' | 'M' | 'F' | 'O';

export interface Siniestro {
  id: string;
  numero_siniestro: string;
  user_id: string;
  nombre_siniestro: string;
  fecha_apertura: string;
  created_at: string;
}

export interface Tramite {
  id: string;
  siniestro_id: string;
  tipo: TramiteType;
  status: TramiteStatus;
  n8n_execution_id?: string;
  url_expediente_zip?: string;
  created_at: string;
  updated_at: string;
}

export interface FacturaRow {
  id?: string;
  tramite_id?: string;
  numero_factura: string;
  importe: number;
  tipo_gasto: FacturaTipo;
}

export interface Adjunto {
  id: string;
  tramite_id: string;
  tipo_documento: string;
  file_path: string;
  file_name?: string;
}
