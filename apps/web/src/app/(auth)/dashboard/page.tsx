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
    <div className="max-w-[1400px] mx-auto space-y-12 pb-20 px-4 pt-6">
      
      {/* SECCIÓN 1: PANORAMA GLOBAL */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gmm-text text-gmm-bg font-black text-sm">1</div>
          <div>
            <h2 className="text-sm font-black text-gmm-text uppercase tracking-[0.2em]">Panorama de Póliza</h2>
            <p className="text-xs text-gmm-text-muted mt-0.5 font-medium">Resumen general de tu cobertura y límites</p>
          </div>
        </div>
        <GlobalPolicyCard 
          totalSum={totalSum}
          consumedSum={consumedSum}
          policyNumber="M172 1011"
        />
      </section>

      {/* SECCIÓN 2: ESTADO FINANCIERO */}
      <section className="space-y-6 pt-8 border-t border-gmm-border/50">
        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gmm-text text-gmm-bg font-black text-sm">2</div>
          <div>
            <h2 className="text-sm font-black text-gmm-text uppercase tracking-[0.2em]">Estado Financiero</h2>
            <p className="text-xs text-gmm-text-muted mt-0.5 font-medium">Distribución del gasto y consumo por categoría médica</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <ConsumptionDonut data={distributionData} />

           <div className="gmm-box p-8 h-full flex flex-col">
              <div className="flex justify-between items-center mb-8">
                 <div>
                    <h3 className="text-[12px] font-black text-gmm-text uppercase tracking-[0.3em]">Detalle por Categoría</h3>
                    <p className="text-[10px] text-gmm-text-muted font-bold uppercase tracking-widest">Desglose de gastos médicos</p>
                 </div>
                 <div className="px-3 py-1 bg-gmm-accent/10 rounded-full text-[8px] font-black text-gmm-accent uppercase tracking-widest">Top: Hospitalización</div>
              </div>
              <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                       <XAxis dataKey="name" fontSize={10} fontWeight="black" axisLine={false} tickLine={false} />
                       <YAxis hide />
                       <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'var(--gmm-card)', 
                            border: '1px solid var(--gmm-border)', 
                            borderRadius: '16px', 
                            fontSize: '10px', 
                            boxShadow: 'var(--gmm-shadow)',
                            color: 'var(--gmm-text)'
                          }} 
                          itemStyle={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '8px' }}
                       />
                       <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--gmm-text)' }} />
                       <Bar dataKey="Hospital" stackId="a" fill="#2563EB">
                          <LabelList dataKey="Hospital" position="center" fill="white" fontSize={8} formatter={(v: number) => v > 0 ? `$${Math.round(v/1000)}k` : ''} />
                       </Bar>
                       <Bar dataKey="Farmacia" stackId="a" fill="#22C55E">
                          <LabelList dataKey="Farmacia" position="center" fill="white" fontSize={8} formatter={(v: number) => v > 0 ? `$${Math.round(v/1000)}k` : ''} />
                       </Bar>
                       <Bar dataKey="Honorarios" stackId="a" fill="#F59E0B">
                          <LabelList dataKey="Honorarios" position="center" fill="white" fontSize={8} formatter={(v: number) => v > 0 ? `$${Math.round(v/1000)}k` : ''} />
                       </Bar>
                       <Bar dataKey="Estudios" stackId="a" fill="#64748B" radius={[4, 4, 0, 0]}>
                          <LabelList dataKey="Estudios" position="center" fill="white" fontSize={8} formatter={(v: number) => v > 0 ? `$${Math.round(v/1000)}k` : ''} />
                       </Bar>

                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>
      </section>

      {/* SECCIÓN 3: OPERACIONES Y ASEGURADOS */}
      <section className="space-y-8 pt-8 border-t border-gmm-border/50">
        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gmm-text text-gmm-bg font-black text-sm">3</div>
          <div>
            <h2 className="text-sm font-black text-gmm-text uppercase tracking-[0.2em]">Operación y Asegurados</h2>
            <p className="text-xs text-gmm-text-muted mt-0.5 font-medium">Gestión de trámites activos y perfiles familiares</p>
          </div>
        </div>

        <ClaimsKanban />

        <div className="space-y-6 pt-4">
          <h3 className="text-[12px] font-black text-gmm-text uppercase tracking-[0.3em] flex items-center gap-3 px-2">
            Perfiles Familiares <span className="text-[10px] font-bold text-gmm-text-muted">({clinicalEvents.length} Activos)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {clinicalEvents.map((event, i) => (
              <EventMonitorCard key={i} event={event} index={i} onPhotoUpload={handlePhotoUpload} />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
