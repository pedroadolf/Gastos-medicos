from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
from supabase import create_client

from src.mcp_handlers import process_mcp_request

router = APIRouter()

# Schema para la petición entrante (muy ligero)
class ClaimReimbursementRequest(BaseModel):
    tramite_id: str
    exchange_rate: Optional[float] = 1.0

# Dependencia para el cliente de Supabase
def get_supabase_client():
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_KEY') # Usamos la de servicio para escribir resultados
    if not url or not key:
        raise HTTPException(status_code=500, detail="Missing Supabase credentials")
    return create_client(url, key)

@router.post("/calculate-reimbursement")
async def calculate_reimbursement_endpoint(
    payload: ClaimReimbursementRequest,
    # Authorization header could be verified here, currently we pass User-ID for demo
    user_id: Optional[str] = Header(None, description="The user ID requesting the calculation"),
    supabase_client = Depends(get_supabase_client)
):
    """
    Endpoint principal para ser consumido por el nodo HTTP Request de n8n.
    Solo espera el tramite_id.
    """
    if not user_id:
        raise HTTPException(status_code=401, detail="User-ID header is required for tenant isolation")
        
    try:
        request_data = {
            "tramite_id": payload.tramite_id,
            "exchange_rate": payload.exchange_rate
        }
        context = {
            "user_id": user_id,
            "supabase_client": supabase_client
        }
        
        # Llamada a la capa de orquestación (mcp_handlers)
        result = process_mcp_request(request_data, context)
        
        if not result.get("success"):
            status_code = result.get("status_code", 400)
            raise HTTPException(status_code=status_code, detail=result.get("error"))
            
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
