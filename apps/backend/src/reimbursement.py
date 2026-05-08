from decimal import Decimal, ROUND_HALF_UP
from src.models import ExpenseData, PolicyConfig, ReimbursementResult
from src.validation import validate_expense_eligibility

def calculate_reimbursement(
    expense: ExpenseData,
    policy: PolicyConfig,
    exchange_rate: float = 1.0
) -> ReimbursementResult:
    """
    Calcula reembolso respetando:
    - Deducible
    - Cobertura %
    - Límite anual
    - Conversión de moneda si es necesario
    
    Validaciones:
    - coverage_percentage debe estar entre 0 y 1
    - exchange_rate debe ser positivo
    """
    # VALIDACIONES NUEVAS
    if not Decimal('0') <= policy.coverage_percentage <= Decimal('1'):
        raise ValueError(f"Coverage percentage must be between 0 and 1, got {policy.coverage_percentage}")
    
    if exchange_rate <= 0:
        raise ValueError(f"Exchange rate must be positive, got {exchange_rate}")
    
    # 1. Convertir montos a Decimal
    expense_amount = expense.amount * Decimal(str(exchange_rate))
    
    # 2. Calcular remanente del límite anual
    remaining_annual = max(Decimal('0'), policy.annual_limit - policy.accumulated_reimbursements)
    
    if remaining_annual == Decimal('0'):
        return ReimbursementResult(
            approved_amount=Decimal('0.00'),
            reason="Annual limit exceeded",
            remaining_annual=Decimal('0.00')
        )
    
    # 3. Aplicar deducible
    if expense_amount <= policy.deductible:
        return ReimbursementResult(
            approved_amount=Decimal('0.00'),
            reason="Expense amount is below or equal to the deductible",
            remaining_annual=remaining_annual.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        )
    
    # 4. Calcular el monto base cubierto
    covered_base = expense_amount - policy.deductible
    
    # 5. Aplicar porcentaje de cobertura
    calculated_reimbursement = covered_base * policy.coverage_percentage
    
    # 6. Topar al límite anual restante
    approved_amount = min(calculated_reimbursement, remaining_annual)
    
    # 7. Redondear a 2 decimales
    approved_amount = approved_amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    new_remaining = (remaining_annual - approved_amount).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    return ReimbursementResult(
        approved_amount=approved_amount,
        reason="Approved",
        remaining_annual=new_remaining
    )
