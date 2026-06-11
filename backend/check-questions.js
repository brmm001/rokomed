// Verifica quantas questões publicadas existem no Turso
const TURSO_URL = 'https://rokomedicina-brmm001.aws-us-east-1.turso.io';
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzgyNTQ4NjEsImlkIjoiMDE5ZTA4M2YtMjYwMS03NTlhLTgyNzUtZDNlNDFmNDk2NGUyIiwicmlkIjoiNWMyY2QyMzMtNTI1ZC00NjMxLWE0NWEtM2VhNGNlM2I1ZTIwIn0.1Hlpl3Ge7T9fCl_KbBm2FothcnWj_Siyfx5d-q6VoiGWUt803p_ysDXBtUzrzaKec9SORMfVZkvKCQAw7wZmDw';

async function q(sql) {
  const res = await fetch(`${TURSO_URL}/v2/pipeline`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TURSO_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests: [{ type: 'execute', stmt: { sql } }, { type: 'close' }] })
  });
  const data = await res.json();
  return data.results?.[0];
}

async function main() {
  const total      = await q(`SELECT COUNT(*) as c FROM questions`);
  const published  = await q(`SELECT COUNT(*) as c FROM questions WHERE isPublished = 1`);
  const withGabarito = await q(`SELECT COUNT(*) as c FROM questions WHERE correctOption IS NOT NULL AND isPublished = 1`);
  const sample     = await q(`SELECT id, isPublished, correctOption FROM questions LIMIT 5`);

  console.log('Total de questões:', total?.rows?.[0]?.[0]);
  console.log('Questões publicadas (isPublished=1):', published?.rows?.[0]?.[0]);
  console.log('Publicadas COM gabarito:', withGabarito?.rows?.[0]?.[0]);
  console.log('\nAmostra de 5 questões:');
  sample?.rows?.forEach(r => console.log('  id:', r[0], '| isPublished:', r[1], '| correctOption:', r[2]));
}

main().catch(console.error);
