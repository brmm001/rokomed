const fs = require('fs');
const path = require('path');

const TURSO_URL = 'https://rokomedicina-brmm001.aws-us-east-1.turso.io';
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzgyNTQ4NjEsImlkIjoiMDE5ZTA4M2YtMjYwMS03NTlhLTgyNzUtZDNlNDFmNDk2NGUyIiwicmlkIjoiNWMyY2QyMzMtNTI1ZC00NjMxLWE0NWEtM2VhNGNlM2I1ZTIwIn0.1Hlpl3Ge7T9fCl_KbBm2FothcnWj_Siyfx5d-q6VoiGWUt803p_ysDXBtUzrzaKec9SORMfVZkvKCQAw7wZmDw';

async function executeStatement(sql) {
  const res = await fetch(`${TURSO_URL}/v2/pipeline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TURSO_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        { type: 'execute', stmt: { sql } },
        { type: 'close' }
      ]
    })
  });
  return res.json();
}

async function main() {
  const sqlFile = path.join(__dirname, 'turso_schema.sql');
  // Read with explicit encoding and strip BOM
  let sql = fs.readFileSync(sqlFile, 'utf8');
  // Remove BOM if present
  sql = sql.replace(/^\uFEFF/, '');
  // Remove Windows-style CR
  sql = sql.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Split on semicolons but keep multi-line CREATE TABLE blocks intact
  const rawStatements = sql.split(/;\s*\n/);
  
  const statements = rawStatements
    .map(s => s.trim())
    .filter(s => {
      if (!s) return false;
      // Skip comment-only lines
      const nonComment = s.replace(/--[^\n]*/g, '').trim();
      return nonComment.length > 0;
    })
    .map(s => {
      // Remove leading comment lines
      return s.replace(/^(--[^\n]*\n)+/, '').trim();
    })
    .filter(s => s.length > 0);

  console.log(`Aplicando ${statements.length} statements no Turso...`);
  console.log('Primeiro statement:', statements[0].substring(0, 80));

  let success = 0;
  let errors = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      const result = await executeStatement(stmt);
      
      if (result.results && result.results[0]) {
        const r = result.results[0];
        if (r.type === 'error') {
          if (r.error && r.error.message && (
            r.error.message.includes('already exists') ||
            r.error.message.includes('duplicate')
          )) {
            console.log(`⚠️  [${i+1}/${statements.length}] Já existe: ${stmt.substring(0, 50)}...`);
          } else {
            console.error(`❌ [${i+1}/${statements.length}] Erro: ${r.error?.message}`);
            console.error('   SQL:', stmt.substring(0, 100));
            errors++;
          }
        } else {
          console.log(`✅ [${i+1}/${statements.length}] OK: ${stmt.substring(0, 50).replace(/\n/g, ' ')}...`);
          success++;
        }
      } else if (result.error) {
        console.error(`❌ [${i+1}/${statements.length}] API Error:`, result.error);
        errors++;
      }
    } catch (e) {
      console.error(`❌ [${i+1}/${statements.length}] Exception:`, e.message);
      errors++;
    }
  }

  console.log(`\n🏁 Concluído! ${success} OK, ${errors} erros.`);
}

main().catch(console.error);
