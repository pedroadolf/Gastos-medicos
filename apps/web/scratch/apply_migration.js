const { Client } = require('pg');
const DATABASE_URL = 'postgresql://postgres:fkztgf1eptvgawi5waxoety9nshwwipe@supabase.pash.uno:5432/postgres';

const sql = `
-- 1. Bases de Inteligencia SRE
CREATE TABLE IF NOT EXISTS anomalies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    severity TEXT NOT NULL,
    count INT DEFAULT 1,
    last_deviation NUMERIC,
    status TEXT DEFAULT 'active',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS preventive_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'executed',
    impact_score NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS decision_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id TEXT,
    action_taken TEXT NOT NULL,
    result TEXT, -- success, failure, neutral
    improvement_score NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Soporte para Runway y Burn Rate
CREATE TABLE IF NOT EXISTS system_forecast_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    current_value NUMERIC,
    threshold NUMERIC,
    message TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de Roles (si falta)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles') THEN
        CREATE TABLE user_roles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID,
            email TEXT,
            role TEXT DEFAULT 'user',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END
$$;
`;

async function main() {
    const client = new Client({ connectionString: DATABASE_URL });
    try {
        await client.connect();
        await client.query(sql);
        console.log('Migration applied successfully!');
    } catch (e) {
        console.error('Migration failed:', e);
        process.exit(1);
    } finally {
        await client.end();
    }
}
main();
