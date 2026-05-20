'use client';

import React from 'react';
import NuevoTramite from '@/components/tramite/NuevoTramite';
import { motion } from 'framer-motion';

export default function CirugiaPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gmm-bg pt-10"
    >
      <NuevoTramite initialTipo="cirugia_programada" />
    </motion.div>
  );
}
