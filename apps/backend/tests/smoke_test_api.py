import requests
import json
import os
from dotenv import load_dotenv

# Cargar entorno
load_dotenv("../../.env")

def run_smoke_test():
    """
    Lanza una petición POST al servidor FastAPI local para validar el endpoint.
    Requiere que el servidor esté corriendo (python server.py).
    """
    url = "http://localhost:8000/api/claims/calculate-reimbursement"
    
    # Datos de prueba (Ajustar con un UUID real de tu base de datos si es posible)
    payload = {
        "tramite_id": "89366e51-c06b-4e12-8705-090c29188e00", # Ejemplo
        "exchange_rate": 1.0
    }
    
    # User-ID para Tenant Isolation (Simulando un login)
    headers = {
        "User-ID": "07e29676-e970-4966-96b5-0c679a77035c", # Ajustar a un user_id real
        "Content-Type": "application/json"
    }
    
    print(f"🚀 Iniciando Smoke Test en {url}...")
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        
        if response.status_code == 200:
            print("✅ SUCCESS: El servidor respondió correctamente.")
            print(json.dumps(response.json(), indent=2))
        elif response.status_code == 404:
            print("⚠️ WARNING: El tramite_id no fue encontrado (esperado si el ID es falso).")
        elif response.status_code == 401:
            print("❌ ERROR: No autorizado (Header User-ID faltante o inválido).")
        else:
            print(f"❌ ERROR {response.status_code}: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: No se pudo conectar al servidor. ¿Está corriendo `python server.py`?")

if __name__ == "__main__":
    run_smoke_test()
