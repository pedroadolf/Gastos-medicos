import { 
  Zap, 
  Folder, 
  FileText, 
  Database, 
  Settings, 
  Activity, 
  Cpu, 
  Shield, 
  GitBranch, 
  AlertTriangle,
  LayoutDashboard,
  Plus
} from 'lucide-react';

export type Role = 'asegurado' | 'operator' | 'admin';

export type MenuItem = {
  label: string;
  href: string;
  icon: any; // Using Lucide icon component reference
  roles: Role[];
  section?: 'core' | 'operation' | 'ai' | 'preferences';
  badge?: 'NEW' | 'AI' | 'BETA';
  destructive?: boolean;
};

export const menuItems: MenuItem[] = [
  // --- CORE SYSTEM (USER) ---
  {
    label: 'Inicio',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['asegurado', 'operator', 'admin'],
    section: 'core'
  },
  {
    label: 'Nuevo Trámite',
    href: '/tramite/nuevo',
    icon: Plus,
    roles: ['asegurado', 'operator', 'admin'],
    section: 'core',
    badge: 'NEW'
  },
  {
    label: 'Mis Trámites',
    href: '/tramites',
    icon: Folder,
    roles: ['asegurado', 'operator', 'admin'],
    section: 'core'
  },
  {
    label: 'Documentos',
    href: '/documentos',
    icon: FileText,
    roles: ['asegurado', 'operator', 'admin'],
    section: 'core'
  },

  // --- OPERATION (OPERATOR / ADMIN) ---
  {
    label: 'Gestión de Trámites',
    href: '/gestion',
    icon: Database,
    roles: ['operator', 'admin'],
    section: 'operation'
  },
  {
    label: 'KPIs & Estados',
    href: '/dashboard/kpi',
    icon: Activity,
    roles: ['operator', 'admin'],
    section: 'operation'
  },

  // --- AI AND SYSTEM (ADMIN ONLY) ---
  {
    label: 'Agentes',
    href: '/agentes',
    icon: Cpu,
    roles: ['admin'],
    section: 'ai',
    badge: 'AI'
  },
  {
    label: 'Workflows & n8n',
    href: '/workflows',
    icon: GitBranch,
    roles: ['admin'],
    section: 'ai'
  },
  {
    label: 'Auditor & Fix',
    href: '/auditoria',
    icon: Shield,
    roles: ['admin'],
    section: 'ai'
  },
  {
    label: 'Logs del Sistema',
    href: '/logs',
    icon: Activity,
    roles: ['admin'],
    section: 'ai'
  },
  {
    label: 'Observabilidad',
    href: '/observabilidad',
    icon: Database,
    roles: ['admin'],
    section: 'ai'
  },
  {
    label: 'Auto-Fix (Critical)',
    href: '/auditoria?action=fix',
    icon: AlertTriangle,
    roles: ['admin'],
    section: 'ai',
    destructive: true
  },

  // --- PREFERENCES ---
  {
    label: 'Configuración',
    href: '/configuracion',
    icon: Settings,
    roles: ['asegurado', 'operator', 'admin'],
    section: 'preferences'
  }
];
