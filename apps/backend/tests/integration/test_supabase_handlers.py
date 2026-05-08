import pytest
import os
from decimal import Decimal
from supabase import create_client, Client
from dotenv import load_dotenv
from src.db_handlers import SupabaseDBHandler

# Cargar .env
load_dotenv("../../.env")

@pytest.fixture
def supabase_client() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    return create_client(url, key)

@pytest.fixture
def db_handler(supabase_client):
    return SupabaseDBHandler(supabase_client)

@pytest.mark.integration
def test_fetch_tramite_full_context_exists(db_handler):
    """
    Valida que el handler pueda obtener el contexto de un trámite real.
    (Requiere que exista al menos un trámite en la BD).
    """
    # Buscamos el primer trámite disponible para el test
    res = db_handler.client.table("tramites").select("id").limit(1).execute()
    if not res.data:
        pytest.skip("No hay trámites en la base de datos para probar.")
    
    tramite_id = res.data[0]['id']
    context = db_handler.fetch_tramite_full_context(tramite_id)
    
    assert "id" in context
    assert "facturas" in context
    assert "policy_config" in context
    # Verificamos que el join de siniestros funcionó
    assert "siniestros" in context
    assert "numero_poliza" in context["siniestros"]

@pytest.mark.integration
def test_get_accumulated_reimbursement_calculation(db_handler):
    """
    Valida la lógica de acumulación anual.
    """
    # Usamos datos de Claudia o Pedro del CSV como referencia
    user_id = "07e29676-e970-4966-96b5-0c679a77035c" # User ID de Claudia/Pedro
    poliza_id = "02001M2012432" # Póliza MetLife del CSV
    year = 2026
    
    accumulated = db_handler.get_accumulated_reimbursement(user_id, poliza_id, year)
    
    assert isinstance(accumulated, Decimal)
    assert accumulated >= 0

@pytest.mark.integration
def test_update_reimbursement_persistence(db_handler):
    """
    Valida que los cambios se guarden realmente en Supabase.
    """
    res = db_handler.client.table("tramites").select("id").limit(1).execute()
    if not res.data:
        pytest.skip("No hay trámites en la base de datos.")
        
    tramite_id = res.data[0]['id']
    factura_res = db_handler.client.table("facturas").select("id").eq("tramite_id", tramite_id).limit(1).execute()
    
    if not factura_res.data:
        pytest.skip("El trámite no tiene facturas para probar persistencia.")
        
    factura_id = factura_res.data[0]['id']
    
    # Simular resultado de cálculo
    test_results = [
        {"factura_id": factura_id, "monto_aprobado": Decimal("100.00"), "reason": "Test Integración"}
    ]
    
    db_handler.update_reimbursement_results(test_results, tramite_id)
    
    # Verificar en BD
    updated_factura = db_handler.client.table("facturas").select("monto_reembolsado, status").eq("id", factura_id).single().execute()
    assert Decimal(str(updated_factura.data['monto_reembolsado'])) == Decimal("100.00")
    assert updated_factura.data['status'] == "procesada"
    
    updated_tramite = db_handler.client.table("tramites").select("monto_total_aprobado, status").eq("id", tramite_id).single().execute()
    assert Decimal(str(updated_tramite.data['monto_total_aprobado'])) == Decimal("100.00")
    assert updated_tramite.data['status'] == "audited"
