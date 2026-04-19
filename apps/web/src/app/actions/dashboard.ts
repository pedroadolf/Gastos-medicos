'use server';

import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { getSupabaseService } from "@/services/supabase";

export async function getInsuredProfiles() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("No autenticado");
  
  // Identificador del usuario: idealmente el email o ID
  const userId = session.user.email || (session.user as any).id;
  const supabase = getSupabaseService();

  // "Validación de RLS" (Validación Server-Side):
  // Aseguramos que el usuario solo pueda leer sus propios perfiles
  const { data, error } = await supabase
    .from('insured_profiles')
    .select('patient_name, photo_url')
    .eq('user_id', userId);

  if (error && error.code !== '42883') console.error('Error fetching profiles:', error);
  return data || [];
}

export async function upsertInsuredProfile(patientName: string, photoUrl: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("No autenticado");
  
  const userId = session.user.email || (session.user as any).id;
  const supabase = getSupabaseService();

  // Al usar Service Role, ignoramos el RLS cliente, pero imponemos el chequeo estricto
  const { error } = await supabase
    .from('insured_profiles')
    .upsert({
      user_id: userId,
      patient_name: patientName,
      photo_url: photoUrl,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id, patient_name' });

  if (error) {
    console.error('Error upserting profile:', error);
    throw error;
  }
  return true;
}

export async function getCriticalAlerts() {
  const supabase = getSupabaseService();
  
  const { data, error } = await supabase
    .from('alerts_log')
    .select('*')
    .in('severity', ['critical', 'error', 'high'])
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
  
  return data.map((a: any) => ({
    id: a.id,
    execution_id: a.execution_id,
    message: a.title || a.reason || 'Alerta de sistema',
    severity: a.severity,
    timestamp: a.created_at,
    impact: a.error_type,
    action: a.action,
    workflow_executions: { workflow_name: a.step || 'Sistema NOC' }
  }));
}
