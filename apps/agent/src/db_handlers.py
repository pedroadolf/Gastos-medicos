import os
from decimal import Decimal
from typing import List, Dict, Any
from supabase import Client

class SupabaseDBHandler:
    """
    Adapter entre el dominio de negocio (models.py) y Supabase.
    """
    
    def __init__(self, client: Client):
        self.client = client

    def fetch_tramite_full_context(self, tramite_id: str) -> Dict[str, Any]:
        """
        Obtiene trámite, facturas, siniestro y configuración de póliza.
        Retorna un dict con toda la información necesaria para el cálculo.
        """
        # Obtenemos el tramite
        tramite_res = self.client.table("tramites").select(
            "id, user_id, siniestro_id, siniestros(numero_poliza)"
        ).eq("id", tramite_id).single().execute()
        
        tramite_data = tramite_res.data
        if not tramite_data:
            raise ValueError(f"Tramite {tramite_id} no encontrado.")
            
        # Obtenemos las facturas
        facturas_res = self.client.table("facturas").select(
            "id, monto_total, moneda, fecha_emision, tipo"
        ).eq("tramite_id", tramite_id).execute()
        
        tramite_data["facturas"] = facturas_res.data
            
        # Obtenemos la configuración de la póliza
        siniestro = tramite_data.get('siniestros')
        if not siniestro or not siniestro.get('numero_poliza'):
            raise ValueError(f"El siniestro asociado al tramite {tramite_id} no tiene numero_poliza configurado.")
            
        poliza_id = siniestro['numero_poliza']
        policy_res = self.client.table("policies_calculadas").select("*").eq("numero_poliza", poliza_id).single().execute()
        
        if not policy_res.data:
            raise ValueError(f"Póliza {poliza_id} no encontrada en policies_calculadas.")
            
        tramite_data['policy_config'] = policy_res.data
        return tramite_data

    def get_accumulated_reimbursement(self, user_id: str, numero_poliza: str, year: int) -> Decimal:
        """
        Suma todos los reembolsos aprobados para el usuario y poliza en el año fiscal.
        Para esto buscamos facturas procesadas de tramites de este usuario.
        """
        start_date = f"{year}-01-01"
        end_date = f"{year}-12-31"
        
        # Sintaxis PostgREST !inner para filtrar tablas relacionadas
        # Cruzamos facturas -> tramites -> siniestros
        response = self.client.table("facturas").select(
            "monto_reembolsado, tramites!inner(user_id, siniestros!inner(numero_poliza))"
        ).eq("tramites.user_id", user_id)\
         .eq("tramites.siniestros.numero_poliza", numero_poliza)\
         .gte("fecha_emision", start_date)\
         .lte("fecha_emision", end_date)\
         .eq("status", "procesada").execute()
        
        total = sum([Decimal(str(f.get('monto_reembolsado') or 0)) for f in response.data])
        return total

    def update_reimbursement_results(self, facturas_results: List[Dict[str, Any]], tramite_id: str):
        """
        Actualiza las facturas individualmente y registra el total en el tramite.
        """
        total_tramite = Decimal("0.00")
        
        for res in facturas_results:
            monto = res['monto_aprobado']
            total_tramite += monto
            
            # Actualizamos factura por factura
            self.client.table("facturas").update({
                "monto_reembolsado": float(monto),
                "status": "procesada" if monto > 0 else "rechazada"
            }).eq("id", res['factura_id']).execute()
            
        # Actualizamos el total en el tramite
        self.client.table("tramites").update({
            "monto_total_aprobado": float(total_tramite),
            "status": "audited"
        }).eq("id", tramite_id).execute()
        
        # Opcional: Registro en tabla de auditoría (si queremos log de score, findings, etc)
        self.client.table("audit_results").insert({
            "tramite_id": tramite_id,
            "score": 100,
            "findings": [{"message": "Procesado por MCP Financial Engine", "total": float(total_tramite)}],
            "recommendations": "Evaluación automatizada completada.",
            "is_auto_fixable": False
        }).execute()

