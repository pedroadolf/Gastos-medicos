'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/services/supabase';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  Shield, AlertCircle, Plus, Clock, Upload
} from 'lucide-react';

// Modular Components
import { EventMonitorCard } from '@/components/dashboard/EventMonitorCard';
import { ReimbursementWaterfall } from '@/components/dashboard/ReimbursementWaterfall';

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
  const [patientPhotos, setPatientPhotos] = useState({});

  useEffect(() => {
    async function loadData() {
       const savedPhotos = localStorage.getItem('gmm-patient-photos');
       if (savedPhotos) setPatientPhotos(JSON.parse(savedPhotos));
       
       try {
         const { data: profiles, error } = await supabase
           .from('insured_profiles')
           .select('patient_name, photo_url');
         
         if (profiles && profiles.length > 0) {
           const profileMap = profiles.reduce((acc, p: any) => ({
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
      if (!session?.user) throw new Error('No sesion activa');
      const userId = (session.user as any).id || (session.user as any).sub || session.user.email;

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

      const { error: dbError } = await supabase
        .from('insured_profiles')
        .upsert({
          user_id: userId,
          patient_name: patientName,
          photo_url: publicUrl,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id, patient_name' });

      if (dbError) throw dbError;

      const newPhotos = { ...patientPhotos, [patientName]: publicUrl };
      setPatientPhotos(newPhotos);
      localStorage.setItem('gmm-patient-photos', JSON.stringify(newPhotos));
      
    } catch (err) {
      console.error('Upload failed:', err);
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result;
        setPatientPhotos((p) => ({ ...p, [patientName]: dataUrl }));
      };
      reader.readAsDataURL(file);
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
      claimId: '02250211464-000',
      diagnosis: 'PRESIÓN (Hipertensión)',
      patientName: 'Claudia', patientPhoto: (patientPhotos as any)['Claudia'] || '/patients/claudia.png', role: 'Titular', age: '57',
      consumed: 9300, sublimit: 5000000, status: 'OPERATIVO'
    },
    {
      claimId: '01210200485-018',
      diagnosis: 'RESPIRATORIAS (nCoV)',
      patientName: 'Pedro', patientPhoto: (patientPhotos as any)['Pedro'] || '/patients/pedro.png', role: 'Conyuge', age: '62',
      consumed: 1250000, sublimit: 5000000, status: 'OPERATIVO', openClaims: 1
    },
    {
      claimId: '03230261780-009',
      diagnosis: 'DIABETES (Diabetes Mellitus)',
      patientName: 'Pedro', patientPhoto: (patientPhotos as any)['Pedro'] || '/patients/pedro.png', role: 'Conyuge', age: '62',
      consumed: 450000, sublimit: 5000000, status: 'EN PROCESO'
    },
    {
      claimId: '042024-PED-001',
      diagnosis: 'RODILLA (Rehabilitación)',
      patientName: 'Sebastian', patientPhoto: (patientPhotos as any)['Sebastian'] || '/patients/sebastian.png', role: 'Hijo', age: '19',
      consumed: 85000, sublimit: 5000000, status: 'OPERATIVO'
    },
    {
      claimId: '052024-EMI-001',
      diagnosis: 'NARIZ (Fisura)',
      patientName: 'Emilio', patientPhoto: (patientPhotos as any)['Emilio'] || '/patients/emilio.png', role: 'Hijo', age: '18',
      consumed: 15000, sublimit: 5000000, status: 'OPERATIVO'
    }
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 pb-20 px-4">
      
      <div className="gmm-pill-card bg-gmm-text text-white p-6 shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Shield size={120} />
         </div>
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Plus size={24} className="text-gmm-accent" />
               </div>
               <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-1">Póliza de Excesos Protegida</h4>
                  <p className="text-xl font-black tracking-tighter">Póliza M172 1011 · Inicio 1 Oct 25</p>
               </div>
            </div>
            <div className="flex gap-8">
               <div className="text-center">
                  <p className="text-[8px] font-black uppercase text-white/40 mb-1">Suma Asegurada</p>
                  <p className="text-xs font-black uppercase text-gmm-accent">Sin Limite</p>
               </div>
               <div className="text-center">
                  <p className="text-[8px] font-black uppercase text-white/40 mb-1">Deducible Exceso</p>
                  <p className="text-xs font-black ">$2,000,000</p>
               </div>
               <div className="text-center">
                  <p className="text-[8px] font-black uppercase text-white/40 mb-1">Coaseguro</p>
                  <p className="text-xs font-black ">10%</p>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <ReimbursementWaterfall />

         <div className="gmm-pill-card bg-white dark:bg-[#1A1A1A] border-none shadow-2xl p-8">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-[12px] font-black text-gmm-text uppercase tracking-[0.3em]">Concentracion por Categoria</h3>
               <div className="px-3 py-1 bg-gmm-accent/10 rounded-full text-[8px] font-black text-gmm-accent uppercase tracking-widest">Top: Hospitalizacion</div>
            </div>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                     <XAxis dataKey="name" fontSize={10} fontWeight="black" axisLine={false} tickLine={false} />
                     <YAxis hide />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#1A1A1A', border: 'none', borderRadius: '16px', fontSize: '10px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} 
                        itemStyle={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '8px' }}
                     />
                     <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                     <Bar dataKey="Hospital" stackId="a" fill="#343434" radius={[0, 0, 0, 0]} />
                     <Bar dataKey="Farmacia" stackId="a" fill="#FFAA00" radius={[0, 0, 0, 0]} />
                     <Bar dataKey="Honorarios" stackId="a" fill="#B22B21" radius={[0, 0, 0, 0]} />
                     <Bar dataKey="Estudios" stackId="a" fill="#D8D9D7" radius={[4, 4, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-[12px] font-black text-gmm-text uppercase tracking-[0.3em] flex items-center gap-3">
          ASEGURADOS <span className="text-[10px] font-bold text-gmm-text-muted">({clinicalEvents.length} Perfiles Activos)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {clinicalEvents.map((event, i) => (
            <EventMonitorCard key={i} event={event} index={i} onPhotoUpload={handlePhotoUpload} />
          ))}
        </div>
      </div>

      <div className="space-y-6">
         <h3 className="text-[12px] font-black text-gmm-text uppercase tracking-[0.3em]">ALERTAS CRITICAS</h3>
         <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 bg-gmm-danger/10 border border-gmm-danger/20 rounded-[2rem] text-gmm-danger">
               <AlertCircle size={20} className="shrink-0" />
               <p className="text-[11px] font-black uppercase tracking-tight">
                 <span className="font-black">ALERTA SUB-LIMITE:</span> Claudia ha consumido el 85% de cobertura oncologica. Acciones preventivas requeridas.
               </p>
               <button className="ml-auto px-6 py-2 bg-gmm-danger text-white text-[9px] font-black rounded-full uppercase tracking-widest hover:scale-105 transition-all">Priorizar</button>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-gmm-accent/10 border border-gmm-accent/20 rounded-[2rem] text-gmm-accent">
               <Clock size={20} className="shrink-0" />
               <p className="text-[11px] font-black uppercase tracking-tight">
                 <span className="font-black">PENDIENTE:</span> Siniestro #4521 vence plazo para subir facturacion de fisioterapia en 3 dias.
               </p>
               <button className="ml-auto px-6 py-2 bg-gmm-accent text-white text-[9px] font-black rounded-full uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2">
                 <Upload size={12} /> Gestionar
               </button>
            </div>
         </div>
      </div>

    </div>
  );
}
