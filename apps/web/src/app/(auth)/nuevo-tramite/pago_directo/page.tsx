'use client';

import React from 'react';
import NuevoTramite from '@/components/tramite/NuevoTramite';
import { motion } from 'framer-motion';

export default function PagoDirectoPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-950 bg-grid-white pt-10"
    >
      <NuevoTramite initialTipo="pago_directo" />
    </motion.div>
  );
}
