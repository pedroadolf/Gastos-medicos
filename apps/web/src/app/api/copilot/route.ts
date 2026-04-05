import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { message } = await request.json();

        // Aquí iría la lógica RAG o llamada a n8n/OpenAI
        // Por ahora simulamos inteligencia sobre el dominio GMM
        let reply = "Entiendo tu consulta sobre los siniestros. Estoy analizando la base de datos de n8n...";
        
        const lowerMsg = message.toLowerCase();
        
        if (lowerMsg.includes('reembolso') || lowerMsg.includes('dinero') || lowerMsg.includes('pagado')) {
            reply = "El monto total reembolsado hasta hoy es de aproximadamente $14,200 USD. Los pagos se procesaron exitosamente por el Agente Validador.";
        } else if (lowerMsg.includes('error') || lowerMsg.includes('fallo') || lowerMsg.includes('rfc')) {
            reply = "He detectado 2 discrepancias en el módulo de Auditoría. Una de ellas es un RFC incorrecto en el siniestro #7721 de Pash Tech. ¿Quieres que ejecute un Auto-Fix?";
        } else if (lowerMsg.includes('agente') || lowerMsg.includes('status')) {
            reply = "Todos los sistemas principales (n8n, Supabase) están Online. Los agentes Extractor y Orquestador operan al 100% de Uptime.";
        } else {
            reply = "He recibido tu mensaje: '" + message + "'. ¿Deseas que analice algún siniestro en específico o que genere un reporte de eficiencia?";
        }

        return NextResponse.json({ reply });

    } catch (error) {
        return NextResponse.json({ error: 'Fallo Neural Link' }, { status: 500 });
    }
}
