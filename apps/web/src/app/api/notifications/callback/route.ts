import { NextResponse } from 'next/server';

// En un entorno productivo, esto podría usar WebSockets o Server-Sent Events (SSE)
// Para esta fase, simularemos el almacenamiento persistente de notificaciones en un estado global 
// (en un caso real, esto iría a Supabase y se escucharía mediante su cliente de Realtime)

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, message, type, claimId, actionUrl } = body;

        // Secreto de validación para asegurar que solo n8n llame a este endpoint
        const secret = request.headers.get('x-gmm-secret');
        if (secret !== process.env.GMM_CALLBACK_SECRET) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        // Aquí n8n nos enviaría:
        // title: "Agente Extractor Finalizó"
        // message: "Siniestro #7721 procesado con 98% de confianza."
        // type: "success" | "error" | "info"

        console.log('--- NOTIFICACIÓN RECIBIDA DE N8N ---');
        console.log(`Título: ${title}`);
        console.log(`Mensaje: ${message}`);
        console.log(`Tipo: ${type}`);
        console.log('------------------------------------');

        // n8n podría haber enviado un webhook a Supabase activando el Realtime UI
        // Por ahora respondemos éxito
        return NextResponse.json({ 
            success: true, 
            received: true, 
            timestamp: new Date().toISOString() 
        });

    } catch (error) {
        return NextResponse.json({ error: 'Fallo al procesar notificación' }, { status: 500 });
    }
}
