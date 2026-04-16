import { getSupabaseService } from '../services/supabase';
import fs from 'fs';
import path from 'path';

async function runMigration() {
    console.log('🚀 Starting Phase 2 Migration...');
    const supabase = getSupabaseService();
    
    const sql = `
    CREATE TABLE IF NOT EXISTS decision_outcomes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        execution_id TEXT NOT NULL,
        workflow_name TEXT NOT NULL,
        action_taken TEXT NOT NULL,
        ai_confidence FLOAT,
        ai_reason TEXT,
        
        -- State Before
        retries_before INT,
        latency_before INT,
        error_before TEXT,

        -- State After
        retries_after INT,
        latency_after INT,
        error_after TEXT,

        result TEXT CHECK (result IN ('success', 'failure', 'neutral')),
        improvement_score FLOAT, -- -1 to +1

        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
    );

    CREATE INDEX IF NOT EXISTS idx_decision_performance ON decision_outcomes(action_taken, result);

    CREATE TABLE IF NOT EXISTS system_forecast_alerts (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL,
        current_value FLOAT,
        threshold FLOAT,
        message TEXT,
        is_resolved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
    );
    `;

    // Note: rpc('n8n_raw_sql') is a common pattern we use for migrations if available
    // Otherwise we'd execute via a helper or direct postgres connection
    // For this environment, we'll assume there's a helper or we'll provide the SQL.
    
    // Attempting direct execution via rpc if configured
    const { error } = await supabase.rpc('exec_sql', { sql_string: sql });

    if (error) {
        console.error('❌ Migration failed:', error.message);
        console.log('👉 Please run the SQL manually in Supabase SQL Editor.');
    } else {
        console.log('✅ Phase 2 Tables created successfully.');
    }
}

runMigration();
