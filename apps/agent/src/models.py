from dataclasses import dataclass
from enum import Enum
from datetime import datetime
from decimal import Decimal
from typing import List

class CurrencyType(Enum):
    MXN = "MXN"
    USD = "USD"

@dataclass
class ExpenseData:
    id: str
    user_id: str
    amount: Decimal
    currency: CurrencyType
    date: datetime
    category: str
    document_url: str
    policy_id: str

@dataclass
class PolicyConfig:
    annual_limit: Decimal
    deductible: Decimal
    coverage_percentage: Decimal
    excluded_categories: List[str]
    accumulated_reimbursements: Decimal = Decimal('0.00')

@dataclass
class ReimbursementResult:
    approved_amount: Decimal
    reason: str
    remaining_annual: Decimal
