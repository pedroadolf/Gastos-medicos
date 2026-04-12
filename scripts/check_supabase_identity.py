import json
import os
import requests
from dotenv import load_dotenv

# Path context
script_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(script_dir, '../apps/web/.env.local')
load_dotenv(env_path)

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

def check_identity():
    print(f"📡 Testing Identity for: {SUPABASE_URL}...")
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    
    try:
        # 1. Check REST Health
        response = requests.get(f"{SUPABASE_URL}/rest/v1/", headers=headers, timeout=10)
        if response.status_code == 200:
            print("✅ REST API: Connected & Authenticated (Service Role)")
            spec = response.json()
            tables = list(spec.get('definitions', {}).keys())
            print(f"📊 Defined Tables/Views: {len(tables)}")
        else:
            print(f"❌ REST API Error: {response.status_code}")
            print(response.text)

        # 2. Check RPC availability
        rpc_check = requests.post(f"{SUPABASE_URL}/rest/v1/rpc/match_embeddings", 
                                 headers=headers, 
                                 json={"query_embedding": "[0]*1536", "match_threshold": 0.5, "match_count": 1},
                                 timeout=10)
        if rpc_check.status_code in [200, 400]: # 400 is fine if the function exists but params mismatch
             print("✅ RPC Layer: Available")
        
    except Exception as e:
        print(f"💥 Connectivity Error: {str(e)}")

if __name__ == "__main__":
    check_identity()
