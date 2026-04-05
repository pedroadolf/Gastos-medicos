'use client';

import { 
  Settings, 
  Key, 
  Database, 
  Shield, 
  User, 
  Bell, 
  Cloud,
  ChevronRight,
  Save,
  RefreshCw,
  Cpu,
  Lock
} from 'lucide-react';
import { useState } from 'react';

export default function ConfigPage() {
  const [activeTab, setActiveTab] = useState('agent');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Configuración sincronizada con el OS Neural Link');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-medical-cyan/10 border border-medical-cyan/20">
                    <Settings className="w-5 h-5 text-medical-cyan" />
                </div>
                <span className="text-[10px] font-black text-medical-cyan uppercase tracking-widest">GMM OS v2.0</span>
            </div>
            <h1 className="text-4xl font-black text-white italic tracking-tighter">Configuración del Sistema</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1 space-y-2">
                <NavButton 
                  icon={<Cpu size={18} />} 
                  label="Agentes & Modelos" 
                  active={activeTab === 'agent'} 
                  onClick={() => setActiveTab('agent')} 
                />
                <NavButton 
                  icon={<Key size={18} />} 
                  label="Seguridad & API" 
                  active={activeTab === 'api'} 
                  onClick={() => setActiveTab('api')} 
                />
                <NavButton 
                  icon={<Database size={18} />} 
                  label="Base de Datos" 
                  active={activeTab === 'db'} 
                  onClick={() => setActiveTab('db')} 
                />
                <NavButton 
                  icon={<User size={18} />} 
                  label="Perfil de Usuario" 
                  active={activeTab === 'profile'} 
                  onClick={() => setActiveTab('profile')} 
                />
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
                <div className="bg-slate-900/40 border border-slate-800 rounded-[40px] p-8 backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-medical-cyan/5 blur-[60px]" />
                    
                    {activeTab === 'agent' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Orquestación de IA</h3>
                                <p className="text-sm text-slate-500">Configura los límites y modelos para los agentes neuronales.</p>
                            </div>
                            
                            <div className="space-y-6">
                                <ConfigOption 
                                    label="Modelo Principal (Orquestador)" 
                                    description="GPT4-o (Recomendado para precisión)" 
                                    toggle={true}
                                    checked={true}
                                />
                                <ConfigOption 
                                    label="Modo de Alta Velocidad" 
                                    description="Usa GPT4-mini para extracciones rápidas" 
                                    toggle={true}
                                    checked={false}
                                />
                                <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-white italic">Límite de Tokens Mensual</p>
                                        <p className="text-xs text-slate-500">Uso actual: 1.2M de 5.0M</p>
                                    </div>
                                    <div className="w-32 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                        <div className="h-full bg-medical-cyan w-[24%]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'api' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                             <div>
                                <h3 className="text-lg font-bold text-white mb-2">Seguridad & Enlaces</h3>
                                <p className="text-sm text-slate-500">Administra los secretos del OS y conexiones externas.</p>
                            </div>
                            <div className="space-y-4">
                                <InputGroup label="N8N Webhook Secret" placeholder="••••••••••••••••" type="password" />
                                <InputGroup label="Supabase Public Key" placeholder="sb_publishable_..." />
                                <div className="pt-4">
                                    <button className="flex items-center gap-2 text-xs font-black text-medical-cyan uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
                                        <RefreshCw size={14} /> Rotar Llaves de Acceso
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                             <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-medical-cyan to-medical-violet flex items-center justify-center text-4xl text-slate-950 font-black italic shadow-2xl">
                                    JD
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white italic">Juan Diego G.</h3>
                                    <p className="text-sm text-slate-500">Administrador de Cuenta Premium</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className="px-2 py-0.5 bg-medical-cyan/10 border border-medical-cyan/20 rounded-lg text-[9px] font-black text-medical-cyan uppercase">Verified</span>
                                    </div>
                                </div>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Nombre" placeholder="Juan Diego G." />
                                <InputGroup label="Correo" placeholder="jd@pash.uno" />
                             </div>
                        </div>
                    )}

                    <div className="mt-12 pt-8 border-t border-slate-800 flex justify-end gap-3">
                         <button className="px-6 py-3 bg-slate-950 border border-slate-800 text-white font-bold rounded-2xl text-xs hover:bg-slate-800 transition-all">Cancelar</button>
                         <button 
                           onClick={handleSave}
                           disabled={isSaving}
                           className="px-8 py-3 bg-medical-cyan text-slate-950 font-black rounded-2xl text-xs hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                         >
                            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            GUARDAR CONFIGURACIÓN
                         </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: any) {
    return (
        <button 
          onClick={onClick}
          className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl border transition-all duration-300 text-left ${
            active 
            ? 'bg-medical-cyan/10 border-medical-cyan/30 text-white' 
            : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900'
          }`}
        >
            <div className={`${active ? 'text-medical-cyan' : 'text-slate-500'} transition-colors`}>{icon}</div>
            <span className="text-sm font-bold tracking-tight">{label}</span>
            {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-medical-cyan shadow-[0_0_8px_rgba(6,182,212,0.6)]" />}
        </button>
    );
}

function ConfigOption({ label, description, toggle, checked }: any) {
    const [isOn, setIsOn] = useState(checked);
    return (
        <div className="p-6 bg-slate-950/50 rounded-3xl border border-slate-800/50 flex items-center justify-between">
            <div className="flex-1">
                <p className="text-sm font-bold text-white italic mb-1">{label}</p>
                <p className="text-xs text-slate-500">{description}</p>
            </div>
            {toggle && (
                <button 
                  onClick={() => setIsOn(!isOn)}
                  className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${isOn ? 'bg-medical-cyan' : 'bg-slate-800'}`}
                >
                    <div className={`w-4 h-4 bg-white rounded-full transition-all shadow-md ${isOn ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
            )}
        </div>
    );
}

function InputGroup({ label, placeholder, type = "text" }: any) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{label}</label>
            <input 
                type={type} 
                defaultValue={placeholder}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-medical-cyan/50 transition-all font-medium"
            />
        </div>
    );
}
