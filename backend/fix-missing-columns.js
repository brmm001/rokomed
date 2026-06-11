// Script para adicionar colunas que faltam no Turso
// Execute com: node fix-missing-columns.js

const TURSO_URL = 'https://rokomedicina-brmm001.aws-us-east-1.turso.io';
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzgyNTQ4NjEsImlkIjoiMDE5ZTA4M2YtMjYwMS03NTlhLTgyNzUtZDNlNDFmNDk2NGUyIiwicmlkIjoiNWMyY2QyMzMtNTI1ZC00NjMxLWE0NWEtM2VhNGNlM2I1ZTIwIn0.1Hlpl3Ge7T9fCl_KbBm2FothcnWj_Siyfx5d-q6VoiGWUt803p_ysDXBtUzrzaKec9SORMfVZkvKCQAw7wZmDw';

async function exec(sql) {
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
  const data = await res.json();
  const r = data.results?.[0];
  if (r?.type === 'error') {
    const msg = r.error?.message || '';
    if (msg.includes('duplicate column') || msg.includes('already exists')) {
      return { skipped: true, msg };
    }
    throw new Error(msg);
  }
  return { ok: true };
}

const migrations = [
  // Colunas da tabela users que podem estar faltando no Turso
  { sql: `ALTER TABLE users ADD COLUMN "onboardingDone" BOOLEAN NOT NULL DEFAULT false`, label: 'users.onboardingDone' },
  { sql: `ALTER TABLE users ADD COLUMN "originInstitution" TEXT`, label: 'users.originInstitution' },
  { sql: `ALTER TABLE users ADD COLUMN "targetSpecialtyId" TEXT`, label: 'users.targetSpecialtyId' },
  { sql: `ALTER TABLE users ADD COLUMN "routineConfig" TEXT`, label: 'users.routineConfig' },
  { sql: `ALTER TABLE users ADD COLUMN "aiCreditsUsed" INTEGER NOT NULL DEFAULT 0`, label: 'users.aiCreditsUsed' },
  { sql: `ALTER TABLE users ADD COLUMN "lastCreditsReset" DATETIME NOT NULL DEFAULT '2025-01-01 00:00:00'`, label: 'users.lastCreditsReset' },

  // Tabelas que podem estar faltando completamente
  {
    sql: `CREATE TABLE IF NOT EXISTS "support_tickets" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "subject" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'OPEN',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      CONSTRAINT "support_tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`,
    label: 'table: support_tickets'
  },
  {
    sql: `CREATE TABLE IF NOT EXISTS "support_messages" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "ticketId" TEXT NOT NULL,
      "senderId" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "support_messages_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "support_tickets" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "support_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`,
    label: 'table: support_messages'
  },
  {
    sql: `CREATE TABLE IF NOT EXISTS "partnership_leads" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "type" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "extra" TEXT,
      "status" TEXT NOT NULL DEFAULT 'NOVO',
      "notes" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    )`,
    label: 'table: partnership_leads'
  },
  {
    sql: `CREATE TABLE IF NOT EXISTS "visitor_clicks" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "email" TEXT,
      "userId" TEXT,
      "buttonType" TEXT NOT NULL,
      "pageUrl" TEXT NOT NULL,
      "ip" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    label: 'table: visitor_clicks'
  },
  {
    sql: `CREATE TABLE IF NOT EXISTS "lessons" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "description" TEXT,
      "videoUrl" TEXT NOT NULL,
      "durationMin" INTEGER,
      "specialtyId" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      CONSTRAINT "lessons_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialties" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    )`,
    label: 'table: lessons'
  },
  {
    sql: `CREATE TABLE IF NOT EXISTS "game_plays" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "gameType" TEXT NOT NULL,
      "date" TEXT NOT NULL,
      "score" INTEGER NOT NULL,
      "isWin" BOOLEAN NOT NULL DEFAULT false,
      "details" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "game_plays_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`,
    label: 'table: game_plays'
  },
  {
    sql: `CREATE TABLE IF NOT EXISTS "institution_priorities" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "institutionId" TEXT NOT NULL,
      "specialtyId" TEXT NOT NULL,
      "priority" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      CONSTRAINT "institution_priorities_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "institution_priorities_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialties" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`,
    label: 'table: institution_priorities'
  },
  {
    sql: `CREATE TABLE IF NOT EXISTS "ai_messages" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "role" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "ai_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`,
    label: 'table: ai_messages'
  },
  // Indexes que podem estar faltando
  { sql: `CREATE UNIQUE INDEX IF NOT EXISTS "institution_priorities_institutionId_specialtyId_key" ON "institution_priorities"("institutionId", "specialtyId")`, label: 'index: institution_priorities_unique' },
];

async function main() {
  console.log('🔧 Aplicando migrações no Turso...\n');
  let ok = 0, skipped = 0, errors = 0;

  for (const m of migrations) {
    try {
      const result = await exec(m.sql);
      if (result.skipped) {
        console.log(`⏭️  JÁ EXISTE: ${m.label}`);
        skipped++;
      } else {
        console.log(`✅ OK: ${m.label}`);
        ok++;
      }
    } catch (e) {
      console.error(`❌ ERRO em ${m.label}: ${e.message}`);
      errors++;
    }
  }

  console.log(`\n🏁 Concluído: ${ok} aplicados, ${skipped} já existiam, ${errors} erros.`);
  if (errors === 0) {
    console.log('\n✅ Banco atualizado! Teste o login agora.');
  } else {
    console.log('\n⚠️  Verifique os erros acima.');
  }
}

main().catch(console.error);
