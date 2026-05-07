from typing import Dict, Any, List
from decimal import Decimal
from datetime import datetime
import json

from src.models import ExpenseData, PolicyConfig, CurrencyType
from src.reimbursement import calculate_reimbursement
from src.validation import validate_expense_eligibility
from src.db_factory import DBFactory

class MCPRequestHandler:
    """
    Handler principal para procesar requests MCP.
    Orquesta validación, cálculo y persistencia asegurando consistencia transaccional.
    """
    
    def __init__(self, db_handler: Any):
        self.db = db_handler
    
    def process_claim_request(self, tramite_id: str, user_id: str, exchange_rate: float = 1.0) -> Dict[str, Any]:
        """
        Procesa un request de cálculo de reembolso a partir del ID de un trámite.
        """
        try:
            # 1. Fetch full context desde BD
            context = self.db.fetch_tramite_full_context(tramite_id)
            
            # 2. Tenant Isolation
            if str(context['user_id']) != str(user_id):
                return {"success": False, "error": "Unauthorized access to claim", "status_code": 403}
                
            facturas = context.get('facturas', [])
            if not facturas:
                return {"success": False, "error": "No facturas found for tramite", "status_code": 400}
                
            poliza_id = context['siniestros']['numero_poliza']
            policy_data = context['policy_config']
            
            # Asumimos que la policy_config viene de 'policies_calculadas'
            # (con suma_asegurada_mxn y deducible_mxn)
            year = datetime.now().year
            accumulated = self.db.get_accumulated_reimbursement(user_id, poliza_id, year)
            
            # Coverage percentage: 1 - (coaseguro_pct / 100)
            coaseguro = Decimal(str(policy_data.get('coaseguro_pct', '10.0')))
            coverage_percentage = Decimal('1.0') - (coaseguro / Decimal('100.0'))
            
            policy = PolicyConfig(
                annual_limit=Decimal(str(policy_data.get('suma_asegurada_mxn', '0.00'))),
                deductible=Decimal(str(policy_data.get('deducible_mxn', '0.00'))),
                coverage_percentage=coverage_percentage,
                excluded_categories=policy_data.get('categorias_excluidas', []),
                accumulated_reimbursements=accumulated
            )
            
            facturas_results = []
            
            # 3. Procesar iterativamente cada factura
            for factura in facturas:
                expense = ExpenseData(
                    id=factura['id'],
                    user_id=user_id,
                    amount=Decimal(str(factura['monto_total'])),
                    currency=CurrencyType(factura.get('moneda', 'MXN')),
                    date=datetime.strptime(str(factura['fecha_emision']), "%Y-%m-%d") if isinstance(factura['fecha_emision'], str) else factura['fecha_emision'],
                    category=factura.get('tipo', 'O'),
                    document_url="N/A",  # Manejado separadamente
                    policy_id=poliza_id
                )
                
                # Eligibility
                is_eligible, eligibility_reason = validate_expense_eligibility(expense, policy)
                
                if not is_eligible:
                    facturas_results.append({
                        "factura_id": expense.id,
                        "monto_aprobado": Decimal("0.00"),
                        "reason": eligibility_reason
                    })
                    continue
                    
                # Calculate reimbursement
                reimbursement = calculate_reimbursement(expense, policy, exchange_rate)
                
                # Actualizamos la poliza en memoria para la siguiente iteración
                # (El accumulated limits incrementa en cascada si hay N facturas)
                policy.accumulated_reimbursements += reimbursement.approved_amount
                
                facturas_results.append({
                    "factura_id": expense.id,
                    "monto_aprobado": reimbursement.approved_amount,
                    "reason": reimbursement.reason
                })
                
            # 4. Consolidar y guardar
            self.db.update_reimbursement_results(facturas_results, tramite_id)
            
            total_aprobado = sum(res['monto_aprobado'] for res in facturas_results)
            
            return {
                "success": True,
                "tramite_id": tramite_id,
                "total_aprobado": float(total_aprobado),
                "facturas": [
                    {
                        "id": r['factura_id'], 
                        "aprobado": float(r['monto_aprobado']), 
                        "razon": r['reason']
                    } for r in facturas_results
                ],
                "status_code": 200
            }
            
        except Exception as e:
            return {"success": False, "error": str(e), "status_code": 500}

# Entrypoint expuesto para MCP / Endpoint
def process_mcp_request(request_data: dict, context: dict) -> dict:
    """
    Punto de entrada orquestador.
    request_data = {"tramite_id": "...", "exchange_rate": 18.0}
    context = {"user_id": "...", "supabase_client": client_instance}
    """
    try:
        tramite_id = request_data.get('tramite_id')
        user_id = context.get('user_id')
        exchange_rate = request_data.get('exchange_rate', 1.0)
        
        db_handler = DBFactory.create_handler('supabase', supabase_client=context.get('supabase_client'))
        handler = MCPRequestHandler(db_handler)
        
        return handler.process_claim_request(tramite_id, user_id, exchange_rate)
    except Exception as e:
        return {"success": False, "error": f"MCP init failed: {str(e)}"}
