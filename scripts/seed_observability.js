const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();

// Load environment variables
dotenv.config({ path: 'apps/web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing credentials in apps/web/.env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('🌱 Starting observability seeding...');

  try {
    // 1. Get or create a sample Siniestro and Tramite for workflow_logs
    let tramiteId;
    const { data: tramites } = await supabase.from('tramites').select('id').limit(1);

    if (tramites && tramites.length > 0) {
      tramiteId = tramites[0].id;
      console.log(`✅ Using existing tramite_id: ${tramiteId}`);
    } else {
      console.log('📝 No tramites found. Creating a dummy one for logs...');
      
      // We need a user_id. Let's try to find one.
      const { data: users } = await supabase.auth.admin.listUsers();
      let userId;
      if (users && users.users && users.users.length > 0) {
        userId = users.users[0].id;
      } else {
        console.warn('⚠️ No users found in auth. Need a user to create tramite.');
        // Fallback or skip workflow_logs seeding
      }

      if (userId) {
        const { data: siniestro } = await supabase.from('siniestros').insert({
          numero_siniestro: 'TEST-OBS-' + Date.now(),
          user_id: userId,
          nombre_siniestro: 'Simulación de Observabilidad'
        }).select().single();

        const { data: tramite } = await supabase.from('tramites').insert({
          siniestro_id: siniestro.id,
          user_id: userId,
          tipo: 'reembolso',
          status: 'processing'
        }).select().single();

        tramiteId = tramite.id;
        console.log(`✅ Created dummy tramite_id: ${tramiteId}`);
      }
    }

    // 2. Seed system_logs
    console.log('📡 Seeding system_logs...');
    const systemLogs = [
      {
        agent: 'Orchestrator',
        node: 'Initialization',
        workflow: 'GMM-Main',
        status: 'success',
        severity: 'info',
        message: 'Sistema iniciado correctamente.',
        metadata: { version: '1.0.0' }
      },
      {
        agent: 'OCR-Engine',
        node: 'Extraction',
        workflow: 'GMM-PDF-Proccess',
        status: 'processing',
        severity: 'info',
        message: 'Extrayendo datos de factura XML...',
        metadata: { file: 'factura_123.xml' }
      },
      {
        agent: 'Auditor',
        node: 'Validation',
        workflow: 'GMM-Audit',
        status: 'error',
        severity: 'warning',
        message: 'Falta firma en formulario SRGMM.',
        error_type: 'VALIDATION_ERROR',
        metadata: { field: 'signature' }
      },
      {
        agent: 'Notification',
        node: 'Email-Sender',
        workflow: 'GMM-Alerts',
        status: 'success',
        severity: 'info',
        message: 'Notificación enviada al usuario.',
        metadata: { recipient: 'user@example.com' }
      }
    ];

    const { error: err1 } = await supabase.from('system_logs').insert(systemLogs);
    if (err1) throw err1;

    // 3. Seed alerts_log
    console.log('📡 Seeding alerts_log...');
    const alerts = [
      {
        title: 'CPU Usage High - Supabase Container',
        status: 'resolved',
        severity: 'warning',
        payload: { cpu: 85, threshold: 80 },
        starts_at: new Date(Date.now() - 3600000).toISOString(),
        ends_at: new Date(Date.now() - 1800000).toISOString()
      },
      {
        title: 'High Error Rate in OCR Node',
        status: 'firing',
        severity: 'critical',
        payload: { error_rate: 0.15, threshold: 0.05 },
        starts_at: new Date(Date.now() - 600000).toISOString()
      }
    ];

    const { error: err2 } = await supabase.from('alerts_log').insert(alerts);
    if (err2) throw err2;

    // 4. Seed workflow_logs (if we have a tramiteId)
    if (tramiteId) {
      console.log('📡 Seeding workflow_logs...');
      const workflowLogs = [
        {
          tramite_id: tramiteId,
          step: 'Recepción',
          status: 'completed',
          message: 'Documentos recibidos vía Webhook.'
        },
        {
          tramite_id: tramiteId,
          step: 'Clasificación',
          status: 'completed',
          message: 'Documentos clasificados como Reembolso.'
        },
        {
          tramite_id: tramiteId,
          step: 'OCR',
          status: 'processing',
          message: 'Procesando facturas (3 de 5)...'
        }
      ];

      const { error: err3 } = await supabase.from('workflow_logs').insert(workflowLogs);
      if (err3) throw err3;
    }

    console.log('✅ Seeding complete! Check your Grafana dashboard.');

  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    process.exit(1);
  }
}

seed();
