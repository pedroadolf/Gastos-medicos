// 🚑 TypeScript Definitions for Core Claims (Siniestros)
import { Receipt, Files, Stethoscope } from 'lucide-react';

export type TramiteType = 'reembolso' | 'carta_pase';
export type TramiteStatus = 'borrador' | 'en_revision' | 'procesando' | 'completado' | 'rechazado';
export type FacturaTipo = 'H' | 'M' | 'F' | 'O';

export const TYPES = [
  {
    id: 'reembolso',
    label: 'Reembolso de Gastos',
    description: 'Recupera los gastos médicos que ya pagaste (Consultas, Medicamentos, etc).',
    icon: Receipt,
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20'
  },
  {
    id: 'carta_pase',
    label: 'Carta Pase Especial',
    description: 'Solicitud de autorización para terapias, estudios especiales o consultas.',
    icon: Files,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20'
  }
];

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
