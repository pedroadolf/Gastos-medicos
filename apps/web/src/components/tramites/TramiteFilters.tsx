// apps/web/src/components/tramites/TramiteFilters.tsx
'use client';

import { Search, Filter, X } from 'lucide-react';
import { useState } from 'react';

interface TramiteFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: any) => void;
}

export function TramiteFilters({ onSearch, onFilterChange }: TramiteFiltersProps) {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const handleSearchChange = (val: string) => {
    setQuery(val);
    onSearch(val);
  };

  const toggleFilter = (key: string, value: string) => {
    const newFilters = { ...activeFilters };
    if (newFilters[key] === value) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-2 bg-slate-900/50 rounded-2xl border border-slate-800 backdrop-blur-md">
      <div className="flex-1 relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-medical-cyan transition-colors" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Buscar por folio, paciente o RFC..."
          className="w-full bg-slate-950/50 border border-slate-800 pl-11 pr-10 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-medical-cyan/50 focus:ring-1 focus:ring-medical-cyan/20 rounded-xl transition-all"
        />
        {query && (
          <button 
            onClick={() => handleSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>
      
      <div className="flex gap-2">
        <FilterDropdown 
          label="Estado" 
          options={['pending', 'processing', 'audited', 'error', 'completed', 'manual_review']} 
          activeValue={activeFilters.estado}
          onSelect={(val: string) => toggleFilter('estado', val)}
        />
        <FilterDropdown 
          label="Aseguradora" 
          options={['AXA', 'MetLife', 'GNP', 'Monterrey']} 
          activeValue={activeFilters.aseguradora}
          onSelect={(val: string) => toggleFilter('aseguradora', val)}
        />
        <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-black text-slate-500 hover:text-white hover:border-slate-700 transition-all uppercase tracking-widest">
          <span>Fecha</span>
          <Filter size={14} className="opacity-50" />
        </button>
      </div>
    </div>
  );
}

function FilterDropdown({ label, options, activeValue, onSelect }: any) {
  return (
    <div className="relative group">
      <button className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all text-xs font-black uppercase tracking-widest ${
        activeValue ? 'bg-medical-cyan/10 border-medical-cyan text-medical-cyan' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-white'
      }`}>
        <span>{activeValue ? activeValue.toUpperCase() : label}</span>
        <Filter size={14} className="opacity-50" />
      </button>
      
      <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all z-50 p-2">
        {options.map((opt: string) => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-colors ${
              activeValue === opt ? 'bg-medical-cyan text-slate-950' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {opt.replace('_', ' ')}
          </button>
        ))}
      </div>
    </div>
  );
}
