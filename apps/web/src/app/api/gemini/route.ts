import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'; // Ensures this route is not statically built
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// Configuration
const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);


export async function POST(request: Request) {
    // Lazy initialize to avoid build-time errors if env vars are missing
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    try {
        const { message } = await request.json();

        if (!message) return NextResponse.json({ error: 'Mensaje vacío' }, { status: 400 });

        // 1. Generate embedding for the query using Gemini embedding-001
        const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
        const embeddingRes = await embeddingModel.embedContent(message);
        const queryVector = embeddingRes.embedding.values;

        // 2. Perform Vector Search on Supabase (match_gmm_kb function)
        // We use 0.7 as threshold and 5 results max
        const { data: matchedChunks, error: supabaseError } = await supabase.rpc('match_gmm_kb', {
            query_embedding: queryVector,
            match_threshold: 0.5,
            match_count: 5
        });

        if (supabaseError) {
          console.error("Supabase vector search error:", supabaseError);
        }

        // 3. Construct Context from matched knowledge
        const contextText = matchedChunks?.map((chunk: any) => chunk.content).join('\n---\n') || 
                            "No se encontró información documental específica. Responde basándote en tu conocimiento general de Gastos Médicos.";

        // 4. Augment Prompt for Gemini 3.1 Flash-Lite
        const model = genAI.getGenerativeModel({ 
            model: "gemini-3.1-flash-lite-preview",
            systemInstruction: "Eres GMM Copilot, un Agente IA experto en seguros de Gastos Médicos Mayores (GMM) y el ecosistema PASH OS. Respondes de forma profesional, rápida y basándote en la información documental proporcionada. Si no sabes algo con precisión, menciona que el equipo de soporte de Pash puede ayudar."
        });

        const prompt = `CONTEXTO DOCUMENTAL:\n${contextText}\n\nPREGUNTA DEL USUARIO: ${message}`;
        
        const chatResult = await model.generateContent(prompt);
        const responseText = await chatResult.response.text();

        return NextResponse.json({ 
          reply: responseText,
          sources: matchedChunks?.length || 0
        });

    } catch (error: any) {
        console.error("Copilot RAG Error:", error);
        return NextResponse.json({ 
          reply: 'Error en Neural Link: ' + (error.message || 'Fallo general de comunicación con Gemini'),
          error: error.message 
        }, { status: 500 });
    }
}

