const { createClient } = require('@libsql/client');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, './.env.turso') });

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  // Check subscriptions for main user (Brayan R Cantoia - rhuangumbi@gmail.com)
  const mainUser = await client.execute(`
    SELECT s.userId, s.status, s.trialEndsAt, u.plan, u.email
    FROM subscriptions s 
    JOIN users u ON u.id = s.userId 
    WHERE u.email IN ('rhuangumbi@gmail.com', 'admin@rokomed.com')
  `);
  console.log('Main user subscriptions:', JSON.stringify(mainUser.rows, null, 2));
  
  // Check all subscriptions status summary
  const summary = await client.execute(`
    SELECT status, COUNT(*) as count FROM subscriptions GROUP BY status
  `);
  console.log('Subscriptions summary:', JSON.stringify(summary.rows, null, 2));
  
  // Check trial subscriptions that have expired
  const now = new Date().toISOString();
  const expiredTrials = await client.execute(`
    SELECT s.userId, s.status, s.trialEndsAt, u.email, u.plan
    FROM subscriptions s
    JOIN users u ON u.id = s.userId
    WHERE s.status = 'trial' AND s.trialEndsAt < '${now}'
    LIMIT 5
  `);
  console.log('Expired trial subscriptions (sample):', JSON.stringify(expiredTrials.rows, null, 2));
  
  await client.close();
}

main().catch(console.error);
