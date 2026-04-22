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
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        <div className="h-px flex-1 bg-slate-200 dark:bg-zinc-800" />
      </div>
      {children}
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
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4 pt-6">
      
      {/* SECCIÓN 1: PANORAMA GLOBAL */}
      <Section 
        title="1. Panorama de Póliza" 
        subtitle="Resumen general de tu cobertura y límites"
      >
        <GlobalPolicyCard 
          totalSum={totalSum}
          consumedSum={consumedSum}
          policyNumber="M172 1011"
        />
      </Section>

      {/* SECCIÓN 2: ESTADO FINANCIERO */}
      <Section 
        title="2. Estado Financiero" 
        subtitle="Distribución del gasto y consumo por categoría médica"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           <ConsumptionDonut data={distributionData} />

           <div className="gmm-box h-full flex flex-col">
              <div className="flex justify-between items-center mb-8">
                 <div>
                    <h3 className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em]">Detalle por Categoría</h3>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-widest">Desglose de gastos médicos</p>
                 </div>
                 <div className="px-3 py-1 bg-blue-500/10 rounded-full text-[8px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Top: Hospitalización</div>
              </div>
              <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                       <XAxis dataKey="name" fontSize={10} fontWeight="black" axisLine={false} tickLine={false} />
                       <YAxis hide />
                       <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: '1px solid #E8E8E8', 
                            borderRadius: '16px', 
                            fontSize: '10px', 
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            color: '#111827'
                          }} 
                          itemStyle={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '8px' }}
                       />
                       <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                       <Bar dataKey="Hospital" fill="#2D6A4F" radius={[4, 4, 0, 0]} />
                       <Bar dataKey="Farmacia" fill="#4A90E2" radius={[4, 4, 0, 0]} />
                       <Bar dataKey="Honorarios" fill="#F5A623" radius={[4, 4, 0, 0]} />
                       <Bar dataKey="Estudios" fill="#9B59B6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>
      </Section>

      {/* SECCIÓN 3: OPERACIONES Y ASEGURADOS */}
      <Section 
        title="3. Operación y Asegurados" 
        subtitle="Gestión de trámites activos y perfiles familiares"
      >
        <div className="space-y-12">
          <div className="w-full">
             <ClaimsKanban />
          </div>

          <div className="space-y-8">
            <h3 className="text-sm font-black tracking-widest text-gray-400 dark:text-zinc-500 uppercase ml-4">
              Perfiles Familiares <span className="text-[10px] font-bold text-gray-300 dark:text-neutral-600">({clinicalEvents.length} Activos)</span>
            </h3>
            <div className="flex flex-col gap-y-12">
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
