import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const timestamp = new Date().toISOString();
  const healthInfo = {
    status: 'UP',
    timestamp,
    services: {
      api: 'OK',
      database: 'UNKNOWN'
    },
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
  };

  try {
    // Verificación rápida de conectividad con Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('missing')) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.from('claims').select('id', { count: 'exact', head: true }).limit(1);

    if (error) {
      console.error('Healthcheck DB Error:', error.message);
      healthInfo.services.database = 'DEGRADED';
      healthInfo.status = 'DEGRADED';
    } else {
      healthInfo.services.database = 'OK';
    }

    return NextResponse.json(healthInfo, { 
      status: healthInfo.status === 'UP' ? 200 : 503 
    });

  } catch (error: any) {
    console.error('Healthcheck System Error:', error);
    
    return NextResponse.json({
      ...healthInfo,
      status: 'DOWN',
      error: error.message
    }, { status: 503 });
  }
}
