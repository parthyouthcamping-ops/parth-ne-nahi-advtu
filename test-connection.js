require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

if (!process.env.DATABASE_URL) {
    console.error("FATAL: DATABASE_URL is not set in .env.local");
    process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function check() {
    console.log("Checking Neon connection...");
    try {
        const res = await sql`SELECT NOW()`;
        console.log("✅ Connection Successful! Current time in DB:", res[0].now);

        const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
        console.log("Tables in database:", tables.map(t => t.table_name).join(", "));
    } catch (e) {
        console.error("❌ Connection Failed:", e.message);
    }
}

check();
