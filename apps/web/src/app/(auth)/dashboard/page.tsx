'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { supabase } from '@/services/supabase';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, LabelList
} from 'recharts';
import { 
  Plus, Upload
} from 'lucide-react';

import { EventMonitorCard } from '@/components/dashboard/EventMonitorCard';
import { ConsumptionDonut } from '@/components/dashboard/ConsumptionDonut';
import { ClaimsKanban } from '@/components/dashboard/ClaimsKanban';
import { GlobalPolicyCard } from '@/components/dashboard/GlobalPolicyCard';
import { getInsuredProfiles, upsertInsuredProfile } from '@/app/actions/dashboard';

// ─── Data Helpers ──────────────

const categoryData = [
  { name: 'Claudia', Hospital: 2000, Farmacia: 5000, Honorarios: 2300, Estudios: 0 },
  { name: 'Pedro', Hospital: 1100000, Farmacia: 400000, Honorarios: 200000, Estudios: 0 },
  { name: 'Sebastian', Hospital: 45000, Farmacia: 20000, Honorarios: 20000, Estudios: 0 },
  { name: 'Emilio', Hospital: 5000, Farmacia: 5000, Honorarios: 5000, Estudios: 0 },
];

// ─── Internal Components ────────

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between gap-6 px-2">
        <div className="flex flex-col">
          <h2 className="text-[16px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[12px] text-slate-400 dark:text-slate-300 font-bold uppercase tracking-widest mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className="h-[2px] flex-1 bg-slate-300/30 dark:bg-white/5 rounded-full" />
      </div>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {children}
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [patientPhotos, setPatientPhotos] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gmm-patient-photos');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });


  useEffect(() => {
    async function loadData() {
       const savedPhotos = localStorage.getItem('gmm-patient-photos');
       if (savedPhotos) setPatientPhotos(JSON.parse(savedPhotos));
       
       try {
         const profiles = await getInsuredProfiles();
         
         if (profiles && profiles.length > 0) {
           const profileMap = profiles.reduce((acc: any, p: any) => ({
             ...acc, [p.patient_name]: p.photo_url
           }), {});
           setPatientPhotos((prev) => ({ ...prev, ...profileMap }));
         }
       } catch (err) {
         console.error('Error loading profiles:', err);
       }
       
       setIsLoading(false);
    }
    loadData();
  }, [session]);

  const handlePhotoUpload = async (patientName: string, file: File) => {
    try {
      if (file.size > 2 * 1024 * 1024) {
        alert("El archivo es muy pesado. Máximo 2MB permitido por políticas de seguridad.");
        return;
      }
      if (!session?.user) throw new Error('No sesion activa');
      const fileExt = file.name.split('.').pop();
      const fileName = `${patientName.toLowerCase()}-${Date.now()}.${fileExt}`;
      const filePath = `insured-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gmm-uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('gmm-uploads')
        .getPublicUrl(filePath);

      await upsertInsuredProfile(patientName, publicUrl);

      const newPhotos = { ...patientPhotos, [patientName]: publicUrl };
      setPatientPhotos(newPhotos);
      localStorage.setItem('gmm-patient-photos', JSON.stringify(newPhotos));
      
    } catch (err: any) {
      console.error('Upload failed:', err);
      alert("Error al subir foto: " + (err.message || "Tus permisos pueden estar limitados (RLS)."));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gmm-bg flex items-center justify-center">
         <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-10 h-10 border-t-2 border-gmm-accent rounded-full" />
      </div>
    );
  }

  const clinicalEvents = [
    {
      claimId: '3230261780-4',
      diagnosis: 'DIABETES MELLITUS',
      chronic: true,
      patientName: 'Pedro A. Soto H.', patientPhoto: (patientPhotos as any)['Pedro A. Soto H.'] || '/patients/pedro.png', role: 'Dependiente', age: '57',
      consumed: 18239, 
      pendingAmount: 2500,
      sublimit: 5000000, 
      deductibleStatus: 'Cumplido ($0)',
      coaseguroPagado: 1824, coaseguroLimit: 17500,
      lastUpdate: 'Jun 17, 2025',
      status: 'OPERATIVO',
      observations: 'Coaseguro 10%.\nRemanente para tope: $15,676. Sin deducible por condiciones de póliza.',
      medications: [
        { name: 'Jardiance 25mg', period: 'Diario', status: 'Surtido' },
        { name: 'Atozet 10/20mg', period: 'Diario', status: 'Surtido' },
        { name: 'Libre Sensor 2', period: 'Cada 14 días', status: 'Pendiente' }
      ]
    },
    {
      claimId: '01210200485-018',
      diagnosis: 'RESPIRATORIAS (nCoV)',
      chronic: false,
      patientName: 'Pedro A. Soto H.', patientPhoto: (patientPhotos as any)['Pedro A. Soto H.'] || '/patients/pedro.png', role: 'Dependiente', age: '57',
      consumed: 1250000, 
      pendingAmount: 50167,
      sublimit: 5000000, 
      deductibleStatus: 'Cumplido',
      coaseguroPagado: 17500, coaseguroLimit: 17500,
      lastUpdate: 'Mar 12, 2025',
      status: 'OPERATIVO',
      observations: 'Siniestro de alta cuantía. Coaseguro topado al 100%.',
      medications: [
        { name: 'Inhaladores (Varios)', period: 'SOS', status: 'Surtido' }
      ]
    },
    {
      claimId: '042024-PED-001',
      diagnosis: 'RODILLA (Rehabilitación)',
      chronic: false,
      patientName: 'Sebastian', patientPhoto: (patientPhotos as any)['Sebastian'] || '/patients/sebastian.png', role: 'Hijo', age: '19',
      consumed: 85000, 
      pendingAmount: 12000,
      sublimit: 5000000, 
      deductibleStatus: 'En proceso',
      coaseguroPagado: 8500, coaseguroLimit: 17500,
      lastUpdate: 'May 04, 2025',
      status: 'OPERATIVO',
      observations: 'Fisioterapia en curso (sesión 12/20).',
      medications: [
        { name: 'Celebrex 200mg', period: '15 días', status: 'Surtido' }
      ]
    },
    {
      claimId: '02250211464-000',
      diagnosis: 'PRESIÓN (Hipertensión)',
      chronic: true,
      patientName: 'Claudia', patientPhoto: (patientPhotos as any)['Claudia'] || '/patients/claudia.png', role: 'Titular', age: '57',
      consumed: 9300, 
      pendingAmount: 0,
      sublimit: 5000000, 
      deductibleStatus: 'En proceso',
      coaseguroPagado: 930, coaseguroLimit: 17500,
      lastUpdate: 'Feb 10, 2025',
      status: 'OPERATIVO',
      observations: '',
      medications: [
        { name: 'Concor 5mg', period: 'Diario', status: 'Surtido' }
      ]
    },
    {
      claimId: '052024-EMI-001',
      diagnosis: 'NARIZ (Fisura)',
      chronic: false,
      patientName: 'Emilio', patientPhoto: (patientPhotos as any)['Emilio'] || '/patients/emilio.png', role: 'Hijo', age: '18',
      consumed: 15000, 
      pendingAmount: 0,
      sublimit: 5000000, 
      deductibleStatus: 'No aplica',
      coaseguroPagado: 0, coaseguroLimit: 17500,
      lastUpdate: 'Nov 20, 2024',
      status: 'REQUERIMIENTO',
      observations: 'Falta informe médico interpretativo de radiología.',
      medications: []
    }
  ];

  const totalSum = 5000000;
  const consumedSum = clinicalEvents.reduce((acc, curr) => acc + curr.consumed, 0);

  const distributionData = [
    { name: 'Pedro', value: 1700000, color: '#2563EB' },
    { name: 'Sebastian', value: 85000, color: '#F59E0B' },
    { name: 'Otros', value: 24300, color: '#64748B' },
  ];

   return (
    <div className="max-w-7xl mx-auto space-y-20 pb-32 px-6 pt-12">
      
      {/* HEADER: BIENVENIDA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-1">
          <p className="text-[13px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.4em]">Panel de Control GMM</p>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Hola, <span className="text-blue-600">Claudia</span>
          </h1>
                    <div className="hidden sm:block">
             <p className="text-[12px] font-black text-slate-400 dark:text-slate-300 uppercase tracking-[0.2em] mb-1">Status Global</p>
             <p className="text-sm font-black text-emerald-500 flex items-center gap-2 justify-end">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
               PÓLIZA ACTIVA
             </p>
           </div>
           <div className="h-10 w-[1px] bg-slate-200 dark:bg-white/10 hidden sm:block mx-2"></div>
           <button className="bg-white dark:bg-zinc-900 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 hover:scale-105 transition-transform">
             <Plus size={20} className="text-slate-900 dark:text-white" />
           </button>
        </div>
      </div>

      {/* SECCIÓN 1: PANORAMA GLOBAL */}
      <Section 
        title="1. Panorama de Póliza" 
        subtitle="Estructura de suma asegurada y deducibles vigentes"
      >
        <GlobalPolicyCard 
          totalSum={totalSum}
          consumedSum={consumedSum}
          policyNumber="M172 1011"
        />
      </Section>

      {/* SECCIÓN 2: ESTADO FINANCIERO */}
      <Section 
        title="2. Análisis Financiero" 
        subtitle="Distribución inteligente del gasto y consumo acumulado"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           <ConsumptionDonut data={distributionData} />

           <div className="gmm-box h-full flex flex-col p-10">
              <div className="flex justify-between items-center mb-10">
                 <div>
                    <h3 className="text-[14px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em]">Consumo por Familiar</h3>
                    <p className="text-[12px] text-slate-400 dark:text-slate-300 font-bold uppercase tracking-widest mt-1">Impacto presupuestal por integrante</p>
                 </div>
                 <div className="px-4 py-1.5 bg-blue-600/10 rounded-full text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.1em]">Tiempo Real</div>
              </div>
              <div className="h-[320px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                       <XAxis dataKey="name" fontSize={12} fontWeight="black" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                       <YAxis hide />
                       <Tooltip 
                          cursor={{fill: 'transparent'}}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                            border: 'none', 
                            borderRadius: '24px', 
                            fontSize: '13px', 
                            boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                            color: '#0f172a',
                            padding: '16px'
                          }} 
                          itemStyle={{ fontWeight: '900', textTransform: 'uppercase', fontSize: '11px', padding: '2px 0' }}
                       />
                       <Legend iconType="circle" wrapperStyle={{ paddingTop: '30px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                       <Bar dataKey="Hospital" fill="#2D6A4F" radius={[8, 8, 0, 0]} barSize={24} />
                       <Bar dataKey="Farmacia" fill="#3B82F6" radius={[8, 8, 0, 0]} barSize={24} />
                       <Bar dataKey="Honorarios" fill="#F59E0B" radius={[8, 8, 0, 0]} barSize={24} />
                       <Bar dataKey="Estudios" fill="#8B5CF6" radius={[8, 8, 0, 0]} barSize={24} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>
      </Section>

      {/* SECCIÓN 3: OPERACIONES Y ASEGURADOS */}
      <Section 
        title="3. Gestión Operativa" 
        subtitle="Control de siniestros activos y grupo asegurado"
      >
        <div className="space-y-16">
          <div className="w-full">
             <ClaimsKanban />
          </div>

          <div className="space-y-10">
            <div className="flex items-center gap-4 ml-4">
              <h3 className="text-sm font-black tracking-[0.2em] text-slate-900 dark:text-white uppercase">
                Perfiles del Grupo
              </h3>
              <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full text-[12px] font-black text-slate-400 uppercase tracking-widest">
                {clinicalEvents.length} Integrantes
              </span>
            </div>
            
            <div className="flex flex-col gap-12">
              {clinicalEvents.map((event, i) => (
                <EventMonitorCard key={i} event={event} index={i} onPhotoUpload={handlePhotoUpload} />
              ))}
            </div>
          </div>
        </div>
      </Section>

    </div>
  );
}
