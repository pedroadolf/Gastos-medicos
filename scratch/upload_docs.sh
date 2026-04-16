#!/bin/bash

# Configuration from .env
SUPABASE_URL="https://supabase.pash.uno"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzI3NTA5OTIsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.arBCFrktA-kgkyz8ASjPbrs-FduxAQOHrA4bqes7Jbo"

# Siniestro IDs found
COVID_ID="99999999-9999-9999-9999-999999999999"
DIABETES_ID="0a2b3b8b-7035-4c7e-9a51-db285ae1b2b7"

UPLOAD_DIR="z edo cuenta siniestros"

upload() {
    local file=$1
    local dest=$2
    local content_type=$3
    
    echo "Uploading $file to $dest..."
    curl -s -X POST "${SUPABASE_URL}/storage/v1/object/gmm-uploads/${dest}" \
        -H "Authorization: Bearer ${SERVICE_KEY}" \
        -H "Content-Type: ${content_type}" \
        --data-binary "@$file"
}

# Upload COVID files
upload "$UPLOAD_DIR/Edo_Cta_Covid_Junio25.pdf" "documentos/siniestros/${COVID_ID}/estados_cuenta/Edo_Cta_Covid_Junio25.pdf" "application/pdf"
upload "$UPLOAD_DIR/Edo_Cta_Covid_Mayo21.pdf" "documentos/siniestros/${COVID_ID}/estados_cuenta/Edo_Cta_Covid_Mayo21.pdf" "application/pdf"

# Upload Diabetes files
upload "$UPLOAD_DIR/Edo_Cta_Diabetes_Julio25.pdf" "documentos/siniestros/${DIABETES_ID}/estados_cuenta/Edo_Cta_Diabetes_Julio25.pdf" "application/pdf"
upload "$UPLOAD_DIR/Edo_Cta_Diabetes_Mayo21.pdf" "documentos/siniestros/${DIABETES_ID}/estados_cuenta/Edo_Cta_Diabetes_Mayo21.pdf" "application/pdf"

# Upload Identifications (generic for now as we don't have user_id, using a 'shared' folder)
upload "$UPLOAD_DIR/Ine_Claudia.pdf" "documentos/identificaciones/Ine_Claudia.pdf" "application/pdf"
upload "$UPLOAD_DIR/Ine_Sebastian.pdf" "documentos/identificaciones/Ine_Sebastian.pdf" "application/pdf"
upload "$UPLOAD_DIR/Ine_Pash_Nva.jpeg" "documentos/identificaciones/Ine_Pash_Nva.jpeg" "image/jpeg"
upload "$UPLOAD_DIR/Pasaporte_Emilio_23_al_29.pdf" "documentos/identificaciones/Pasaporte_Emilio_23_al_29.pdf" "application/pdf"

echo "Upload completed."
