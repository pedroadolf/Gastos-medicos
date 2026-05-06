import pytest
from datetime import datetime, timedelta
from decimal import Decimal
from src.models import ExpenseData, PolicyConfig, CurrencyType, ReimbursementResult
from src.reimbursement import calculate_reimbursement
from src.validation import validate_expense_eligibility, check_duplicate_claim

@pytest.fixture
def base_policy():
    """Fixture de póliza realista en MXN con deducible de $500 y cobertura del 80%."""
    return PolicyConfig(
        annual_limit=Decimal('100000.00'),
        deductible=Decimal('500.00'),
        coverage_percentage=Decimal('0.80'),
        excluded_categories=["cosmetic"],
        accumulated_reimbursements=Decimal('0.00')
    )

@pytest.fixture
def base_expense():
    return ExpenseData(
        id="EXP-001",
        user_id="USR-123",
        amount=Decimal('1000.00'),
        currency=CurrencyType.MXN,
        date=datetime.now(),
        category="medical",
        document_url="http://s3/doc.pdf",
        policy_id="POL-2026-XYZ"
    )

@pytest.mark.critical
def test_reimbursement_below_deductible(base_policy, base_expense):
    base_expense.amount = Decimal('300.00')
    result = calculate_reimbursement(base_expense, base_policy)
    assert result.approved_amount == Decimal('0.00')
    assert "below or equal to the deductible" in result.reason

@pytest.mark.critical
def test_reimbursement_standard_calculation(base_policy, base_expense):
    # Gasto: 1000, Deducible: 500, Cobertura: 80% -> Esperado: 400.
    result = calculate_reimbursement(base_expense, base_policy)
    assert result.approved_amount == Decimal('400.00')

@pytest.mark.critical
def test_reimbursement_exceeds_annual_limit(base_policy, base_expense):
    # Límite 100k, acumulado 99.5k. Quedan 500 disponibles.
    base_policy.accumulated_reimbursements = Decimal('99500.00')
    base_expense.amount = Decimal('2000.00')
    result = calculate_reimbursement(base_expense, base_policy)
    # Cálculo normal: (2000-500)*0.8 = 1200. Tope = 500.
    assert result.approved_amount == Decimal('500.00')
    assert result.remaining_annual == Decimal('0.00')

@pytest.mark.critical
def test_duplicate_expense_rejected():
    # Mock de db_handler
    def mock_db_handler(user_id: str, expense_id: str) -> bool:
        return expense_id == "8A52F72B-C8EE-4BB3-98C1-F0B06B1F9F68"
    
    is_duplicate, reason = check_duplicate_claim(
        "8A52F72B-C8EE-4BB3-98C1-F0B06B1F9F68",
        "USR-123",
        db_handler=mock_db_handler
    )
    assert is_duplicate is True
    
    is_not_duplicate, reason = check_duplicate_claim(
        "NEW-UUID-123",
        "USR-123",
        db_handler=mock_db_handler
    )
    assert is_not_duplicate is False

@pytest.mark.critical
def test_mixed_currency_conversion(base_policy, base_expense):
    # Gasto en USD: 100 * 18 = 1800 MXN. (1800 - 500) * 0.8 = 1040.
    base_expense.amount = Decimal('100.00')
    base_expense.currency = CurrencyType.USD
    result = calculate_reimbursement(base_expense, base_policy, exchange_rate=18.0)
    assert result.approved_amount == Decimal('1040.00')

@pytest.mark.critical
def test_future_expense_rejected(base_policy, base_expense):
    base_expense.date = datetime.now() + timedelta(days=10)
    is_eligible, reason = validate_expense_eligibility(base_expense, base_policy)
    assert is_eligible is False
    assert "future" in reason.lower()

# TESTS NUEVOS PARA VALIDACIONES AGREGADAS

@pytest.mark.critical
def test_negative_expense_amount_rejected(base_policy, base_expense):
    """Gasto negativo debe ser rechazado"""
    base_expense.amount = Decimal('-100.00')
    is_eligible, reason = validate_expense_eligibility(base_expense, base_policy)
    assert is_eligible is False
    assert "positive" in reason.lower()

@pytest.mark.critical
def test_old_expense_rejected(base_policy, base_expense):
    """Gasto más antiguo de 12 meses debe ser rechazado"""
    base_expense.date = datetime.now() - timedelta(days=366)
    is_eligible, reason = validate_expense_eligibility(base_expense, base_policy)
    assert is_eligible is False
    assert "older than" in reason.lower()

@pytest.mark.critical
def test_excluded_category_rejected(base_policy, base_expense):
    """Categoría excluida debe ser rechazada"""
    base_expense.category = "cosmetic"  # Está en excluded_categories
    is_eligible, reason = validate_expense_eligibility(base_expense, base_policy)
    assert is_eligible is False
    assert "excluded" in reason.lower()

@pytest.mark.critical
def test_invalid_coverage_percentage_raises_error(base_policy, base_expense):
    """Coverage percentage > 1 debe lanzar error"""
    base_policy.coverage_percentage = Decimal('1.5')  # 150% inválido
    with pytest.raises(ValueError, match="Coverage percentage"):
        calculate_reimbursement(base_expense, base_policy)

@pytest.mark.critical
def test_negative_exchange_rate_raises_error(base_policy, base_expense):
    """Exchange rate negativo debe lanzar error"""
    with pytest.raises(ValueError, match="Exchange rate"):
        calculate_reimbursement(base_expense, base_policy, exchange_rate=-1.0)
