const bcrypt = require('bcryptjs');

async function run() {
  try {
    const hash = await bcrypt.hash('123456', 12);
    // Delete if exists
    const sqlDelete = `DELETE FROM users WHERE email = 'admin@rokomed.com'`;
    const sqlInsert = `INSERT INTO users (id, email, name, passwordHash, role, plan, xp, streak, isBanned, createdAt, updatedAt) 
                       VALUES ('usr_admin_test', 'admin@rokomed.com', 'Conta de Testes (Admin)', '${hash}', 'SUPERADMIN', 'PRO', 9999, 100, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`;

    const TURSO_URL = 'https://rokomedicina-brmm001.aws-us-east-1.turso.io';
    const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzgyNTQ4NjEsImlkIjoiMDE5ZTA4M2YtMjYwMS03NTlhLTgyNzUtZDNlNDFmNDk2NGUyIiwicmlkIjoiNWMyY2QyMzMtNTI1ZC00NjMxLWE0NWEtM2VhNGNlM2I1ZTIwIn0.1Hlpl3Ge7T9fCl_KbBm2FothcnWj_Siyfx5d-q6VoiGWUt803p_ysDXBtUzrzaKec9SORMfVZkvKCQAw7wZmDw';

    const res = await fetch(`${TURSO_URL}/v2/pipeline`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${TURSO_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [
          { type: 'execute', stmt: { sql: sqlDelete, args: [] } },
          { type: 'execute', stmt: { sql: sqlInsert, args: [] } },
          { type: 'close' }
        ]
      })
    });
    
    const result = await res.json();
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(err);
  }
}
run();
