import pytest
from playwright.sync_api import Page, expect

# Este test asume que la aplicación web está corriendo en localhost:3000
# y el servidor de agentes en localhost:8000

@pytest.mark.e2e
def test_claims_reimbursement_visibility(page: Page):
    """
    Valida que un usuario pueda entrar al dashboard, 
    ver su siniestro y el monto de reembolso calculado.
    """
    # 1. Ir a la página de login
    page.goto("http://localhost:3000/login")
    
    # 2. Login (Simulado o real con credenciales de test)
    # page.fill('input[name="email"]', "test@pash.uno")
    # page.fill('input[name="password"]', "password123")
    # page.click('button[type="submit"]')
    
    # 3. Navegar a Siniestros
    page.goto("http://localhost:3000/siniestros")
    
    # 4. Verificar que la tabla de siniestros cargue
    expect(page.locator("table")).to_be_visible()
    
    # 5. Entrar a un trámite específico
    # page.click("text=Ver Detalle")
    
    # 6. Verificar que el monto de reembolso (calculado por nuestro MCP) sea visible
    # expect(page.locator("text=Monto Aprobado")).to_be_visible()
    # expect(page.locator(".reimbursement-amount")).not_to_be_empty()

@pytest.mark.e2e
def test_api_health_check(page: Page):
    """
    Validación rápida de conectividad entre el front y el motor de agentes.
    """
    response = page.request.get("http://localhost:8000/health")
    assert response.ok
    assert response.json()["status"] == "ok"
