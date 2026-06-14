const { createClient } = require('@libsql/client');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.turso') });

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  const qStats = await client.execute("SELECT COUNT(*) as total, SUM(CASE WHEN isPublished = 1 THEN 1 ELSE 0 END) as published FROM questions");
  const lStats = await client.execute("SELECT COUNT(*) as total FROM lessons");
  const sStats = await client.execute("SELECT COUNT(*) as total FROM specialties");
  
  console.log(`📊 DB Status:`);
  console.log(`   - Total Questions: ${qStats.rows[0].total}`);
  console.log(`   - Published Questions: ${qStats.rows[0].published}`);
  console.log(`   - Total Lessons: ${lStats.rows[0].total}`);
  console.log(`   - Total Specialties: ${sStats.rows[0].total}`);

  await client.close();
}

main().catch(console.error);
