import os
from typing import Dict, Any, Optional
from src.db_handlers import SupabaseDBHandler

class DBFactory:
    """
    Factory para inyectar diferentes handlers según el contexto.
    - Producción: Supabase client real
    - Testing: Mock handler
    """
    
    @staticmethod
    def create_handler(handler_type: str = 'supabase', **kwargs) -> Any:
        """
        Args:
            handler_type: 'supabase' (prod) o 'mock' (test)
            **kwargs: Cliente de Supabase o datos mock
        """
        if handler_type == 'supabase':
            client = kwargs.get('supabase_client')
            if not client:
                raise ValueError("supabase_client is required for Supabase handler")
            return SupabaseDBHandler(client)
        elif handler_type == 'mock':
            return MockDBHandler(kwargs.get('data', {}))
        else:
            raise ValueError(f"Unknown handler type: {handler_type}")

class MockDBHandler:
    """
    Mock handler para testing sin BD real.
    """
    
    def __init__(self, data: Dict[str, Any]):
        self.data = data
        self.tramites = data.get('tramites', {})
        self.accumulated = data.get('accumulated', Decimal('0.00'))
    
    def fetch_tramite_full_context(self, tramite_id: str) -> Dict[str, Any]:
        if tramite_id not in self.tramites:
            raise ValueError(f"Tramite {tramite_id} no encontrado")
        return self.tramites[tramite_id]
        
    def get_accumulated_reimbursement(self, user_id: str, numero_poliza: str, year: int):
        return self.accumulated
        
    def update_reimbursement_results(self, facturas_results: list, tramite_id: str):
        pass # Simula éxito
