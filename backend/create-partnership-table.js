const TURSO_URL = 'https://rokomedicina-brmm001.aws-us-east-1.turso.io';
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzgyNTQ4NjEsImlkIjoiMDE5ZTA4M2YtMjYwMS03NTlhLTgyNzUtZDNlNDFmNDk2NGUyIiwicmlkIjoiNWMyY2QyMzMtNTI1ZC00NjMxLWE0NWEtM2VhNGNlM2I1ZTIwIn0.1Hlpl3Ge7T9fCl_KbBm2FothcnWj_Siyfx5d-q6VoiGWUt803p_ysDXBtUzrzaKec9SORMfVZkvKCQAw7wZmDw';

const SQL = `
CREATE TABLE IF NOT EXISTS partnership_leads (
  id        TEXT PRIMARY KEY,
  type      TEXT NOT NULL,
  name      TEXT NOT NULL,
  email     TEXT NOT NULL,
  extra     TEXT,
  status    TEXT NOT NULL DEFAULT 'NOVO',
  notes     TEXT,
  createdAt DATETIME NOT NULL DEFAULT (datetime('now')),
  updatedAt DATETIME NOT NULL DEFAULT (datetime('now'))
)
`;

async function run() {
  const res = await fetch(`${TURSO_URL}/v2/pipeline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TURSO_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        { type: 'execute', stmt: { sql: SQL.trim() } },
        { type: 'close' }
      ]
    })
  });
  const data = await res.json();
  const r = data.results?.[0];
  if (r?.type === 'error') {
    console.error('❌ Erro:', r.error?.message);
  } else {
    console.log('✅ Tabela partnership_leads criada com sucesso!');
  }
}

run().catch(console.error);
