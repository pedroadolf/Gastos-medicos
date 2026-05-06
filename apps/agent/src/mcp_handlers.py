# TODO: Implementar conectores de n8n-MCP
def process_mcp_request(request_data: dict, context: dict) -> dict:
    """
    Punto de entrada para el MCP.
    Debe validar:
    1. Tenant isolation
    2. JWT
    3. Firma
    4. Enrutar a la lógica de negocio correspondiente
    """
    return {"success": False, "error": "Not implemented"}
