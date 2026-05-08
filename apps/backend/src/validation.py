from typing import Tuple, Optional, Callable
from datetime import datetime, timedelta
from decimal import Decimal
from src.models import ExpenseData, PolicyConfig

def check_duplicate_claim(
    expense_id: str,
    user_id: str,
    db_handler: Optional[Callable[[str, str], bool]] = None
) -> Tuple[bool, str]:
    """
    Verifica si el expense_id ya existe para este usuario.
    
    Args:
        expense_id: ID único del gasto
        user_id: ID del usuario
        db_handler: Función inyectable para consulta (opcional, para testing)
        
    Returns:
        (is_duplicate: bool, reason: str)
    """
    if db_handler is None:
        return False, "No database handler (test mode)"
    
    try:
        exists = db_handler(user_id, expense_id)
        if exists:
            return True, f"Duplicate claim found for expense {expense_id}"
        return False, "Not a duplicate"
    except Exception as e:
        raise ValueError(f"Duplicate check failed: {str(e)}")

def validate_expense_eligibility(
    expense: ExpenseData,
    policy: PolicyConfig
) -> Tuple[bool, str]:
    """
    Valida si el gasto es elegible según:
    - Fechas (no futuro, no muy antiguo)
    - Categorías excluidas
    - Montos válidos
    """
    # VALIDACIÓN: Monto debe ser positivo
    if expense.amount <= Decimal('0'):
        return False, "Expense amount must be positive"
    
    # VALIDACIÓN: Límite anual positivo
    if policy.annual_limit <= Decimal('0'):
        return False, "Policy annual limit must be positive"
    
    # VALIDACIÓN: Deducible no negativo
    if policy.deductible < Decimal('0'):
        return False, "Policy deductible cannot be negative"
    
    # VALIDACIÓN: Fecha no futura
    if expense.date > datetime.now():
        return False, "Expense date cannot be in the future"
    
    # VALIDACIÓN: Antigüedad máxima 12 meses
    cutoff_date = datetime.now() - timedelta(days=365)
    if expense.date < cutoff_date:
        return False, "Expense is older than 12 months"
    
    # VALIDACIÓN: Categoría no excluida
    if expense.category in policy.excluded_categories:
        return False, f"Category {expense.category} is excluded from policy"
    
    return True, "Eligible"
