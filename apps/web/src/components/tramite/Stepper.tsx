'use client';

import React from 'react';
import { Check, Dot } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="w-full flex items-center justify-between mb-12">
      {steps.map((step, idx) => (
        <React.Fragment key={step.id}>
          {/* Step Icon & Label */}
          <div className="flex flex-col items-center group relative">
            <div className="relative mb-2">
              <motion.div
                initial={false}
                animate={{
                  scale: currentStep >= step.id ? 1 : 0.8,
                  opacity: currentStep >= step.id ? 1 : 0.4,
                }}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                  currentStep > step.id 
                    ? "bg-emerald-500 border-emerald-500 text-white" 
                    : currentStep === step.id 
                    ? "bg-cyan-500 border-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                    : "bg-slate-900 border-slate-800 text-slate-500"
                )}
                style={currentStep === step.id ? { backgroundColor: '#06b6d4', borderColor: '#06b6d4' } : undefined}
              >
                {currentStep > step.id ? (
                  <Check size={18} strokeWidth={3} />
                ) : (
                  <span className="text-sm font-black">{step.id}</span>
                )}
              </motion.div>
              
              {/* Pulse effect for active step */}
              {currentStep === step.id && (
                <span 
                  className="absolute inset-0 rounded-full bg-cyan-500 animate-ping opacity-20 pointer-events-none" 
                  style={{ backgroundColor: '#06b6d4' }}
                />
              )}
            </div>
            
            <span 
              className={cn(
                "text-[10px] font-black uppercase tracking-widest absolute -bottom-6 w-max transition-all duration-300",
                currentStep > step.id ? "text-emerald-600 dark:text-emerald-400 scale-105" :
                currentStep === step.id ? "text-slate-900 dark:text-slate-100 font-black" : "text-slate-500"
              )}
              style={currentStep === step.id ? { color: 'var(--gmm-text)' } : undefined}
            >
              {currentStep > step.id ? (
                <span className="flex items-center gap-1">
                   {step.label} <Check size={10} strokeWidth={4} />
                </span>
              ) : step.label}
            </span>
          </div>

          {/* Connector Line */}
          {idx < steps.length - 1 && (
            <div className="flex-1 mx-4 h-[2px] bg-slate-800/50 mb-2 overflow-hidden">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: currentStep > step.id ? 1 : 0 }}
                style={{ originX: 0 }}
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500"
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
