require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Faltan variables de entorno en .env.local");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function ingestFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  
  console.log(`\n📄 Procesando: ${fileName}...`);
  
  // 1. Chunking simple (por ahora por párrafos o bloques de 2000 chars)
  const chunks = content.split('\n\n').filter(c => c.trim().length > 50);
  
  const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

  for (const chunk of chunks) {
    try {
      // 2. Generate Embedding
      const result = await embeddingModel.embedContent(chunk);
      const embedding = result.embedding.values;
      
      // 3. Upsert to Supabase
      const { error } = await supabase
        .from('gmm_kb')
        .insert({
          content: chunk,
          metadata: { source: fileName, path: filePath, ingested_at: new Date().toISOString() },
          embedding: embedding
        });
        
      if (error) throw error;
      process.stdout.write("⚡");
    } catch (e) {
      console.error(`\n❌ Error en chunk: ${e.message}`);
    }
  }
}

async function main() {
  const kbDir = path.join(process.cwd(), '../../docs/knowledge');
  if (!fs.existsSync(kbDir)) {
    console.error("❌ Directorio de conocimiento no encontrado: ", kbDir);
    return;
  }

  // Walk through docs/knowledge recursively
  const getAllFiles = (dirPath, arrayOfFiles) => {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    files.forEach((file) => {
      if (fs.statSync(dirPath + "/" + file).isDirectory()) {
        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
      } else {
        if (file.endsWith('.md') || file.endsWith('.txt')) {
          arrayOfFiles.push(path.join(dirPath, "/", file));
        }
      }
    });
    return arrayOfFiles;
  };

  const files = getAllFiles(kbDir);
  console.log(`🚀 Iniciando ingesta de ${files.length} archivos para Gemini RAG...`);

  for (const file of files) {
    await ingestFile(file);
  }
  
  console.log("\n\n✅ Ingesta completada con éxito.");
}

main();
