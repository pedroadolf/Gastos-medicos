"use client";

import React from 'react';
import { AlertCircle, Database, RefreshCcw, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  title: string;
  description: string;
  type?: 'empty' | 'error' | 'config' | 'loading';
  onRetry?: () => void;
}

/**
 * Componente premium para estados de fallback.
 * Diseñado para ser informativo y estéticamente agradable.
 */
export function EmptyState({ 
  title, 
  description, 
  type = 'empty', 
  onRetry 
}: EmptyStateProps) {
  
  const icons = {
    empty: <Database className="w-12 h-12 text-slate-400" />,
    error: <WifiOff className="w-12 h-12 text-rose-400" />,
    config: <AlertCircle className="w-12 h-12 text-amber-400" />,
    loading: <RefreshCcw className="w-12 h-12 text-blue-400 animate-spin" />
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50"
    >
      <div className="mb-4 p-4 rounded-full bg-white shadow-sm border border-slate-100">
        {icons[type]}
      </div>
      
      <h3 className="text-xl font-semibold text-slate-800 mb-2">
        {title}
      </h3>
      
      <p className="max-w-xs text-slate-500 text-sm mb-6 leading-relaxed">
        {description}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all font-medium text-sm"
        >
          <RefreshCcw className="w-4 h-4" />
          Reintentar operación
        </button>
      )}
      
      {type === 'config' && (
        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100 text-amber-700 text-xs">
          Tip: Verifica las variables de entorno en tu panel de control.
        </div>
      )}
    </motion.div>
  );
}
