// /hooks/useWorkflowLogs.ts
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export interface WorkflowLog {
  id: string
  tramite_id: string
  step: string
  status: 'success' | 'error' | 'processing'
  message?: string
  metadata?: Record<string, any>
  created_at: string
}

export function useWorkflowLogs(tramiteId: string) {
  const [logs, setLogs] = useState<WorkflowLog[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = async () => {
    if (!tramiteId) return
    setLoading(true)

    const { data, error } = await supabase
      .from("workflow_logs")
      .select("*")
      .eq("tramite_id", tramiteId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching logs:", error)
    } else {
      setLogs(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchLogs()

    // Realtime subscription
    const channel = supabase
      .channel(`logs:${tramiteId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workflow_logs',
          filter: `tramite_id=eq.${tramiteId}`
        },
        (payload: any) => {
          setLogs((prev) => [payload.new, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tramiteId])

  return { logs, loading, refetch: fetchLogs }
}
