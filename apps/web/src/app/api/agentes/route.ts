import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, agentId, claimId, payload } = body;

        let webhookUrl = '';
        
        switch (action) {
            case 'diagnostic':
                webhookUrl = process.env.N8N_AGENT_ACTION_URL || '';
                break;
            case 'autofix':
                webhookUrl = process.env.N8N_AUTOFIX_URL || '';
                break;
            default:
                return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
        }

        if (!webhookUrl) {
            return NextResponse.json({ error: 'Webhook URL no configurada' }, { status: 500 });
        }

        // Llamar a n8n
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Host': process.env.N8N_WEBHOOK_HOST_HEADER || 'n8n.pash.uno',
                'x-gmm-secret': process.env.GMM_CALLBACK_SECRET || ''
            },
            body: JSON.stringify({
                action,
                agentId,
                claimId,
                timestamp: new Date().toISOString(),
                ...payload
            })
        });

        if (!response.ok) {
            throw new Error(`n8n respondió con error: ${response.status}`);
        }

        const data = await response.json();
        
        return NextResponse.json({ 
            success: true, 
            message: `Acción ${action} ejecutada correctamente`, 
            n8nResponse: data 
        });

    } catch (error: any) {
        console.error('Error en API Agentes:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Error interno del servidor' 
        }, { status: 500 });
    }
}
