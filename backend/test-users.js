const { createClient } = require('@libsql/client');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, './.env.turso') });

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  const users = await client.execute("SELECT id, email, name, role, plan, isBanned FROM users LIMIT 20");
  console.log(JSON.stringify(users.rows, null, 2));
  await client.close();
}

main().catch(console.error);
