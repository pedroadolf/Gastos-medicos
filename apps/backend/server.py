import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Cargamos el archivo .env de la raíz
load_dotenv("../../.env")

from app.api.claims import router as claims_router

app = FastAPI(
    title="GMM Agent MCP Server",
    description="Servidor de agentes y reglas de negocio financieras para la aplicación Gastos Médicos",
    version="1.0.0"
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restringir en producción
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registramos el router de claims
app.include_router(claims_router, prefix="/api/claims", tags=["Claims"])

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "gmm-agent-mcp"}

if __name__ == "__main__":
    import uvicorn
    # Puerto por defecto 8000
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
