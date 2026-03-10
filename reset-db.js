require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

if (!process.env.DATABASE_URL) {
    console.error("ERROR: DATABASE_URL is not set in .env.local");
    process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function clearAndInit() {
    console.log("Starting Fresh: Leveling Neon Database to 0...");

    try {
        console.log("- Dropping old tables (if any)...");
        await sql`DROP TABLE IF EXISTS quotations CASCADE`;
        await sql`DROP TABLE IF EXISTS brand_settings CASCADE`;

        console.log("- Creating fresh 'quotations' table...");
        await sql`
            CREATE TABLE quotations (
                id TEXT PRIMARY KEY,
                slug TEXT UNIQUE,
                data JSONB,
                updated_at TIMESTAMPTZ DEFAULT NOW(),
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `;

        console.log("- Creating fresh 'brand_settings' table...");
        await sql`
            CREATE TABLE brand_settings (
                id TEXT PRIMARY KEY,
                data JSONB,
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `;

        console.log("- Creating slug index...");
        await sql`CREATE INDEX idx_quotations_slug ON quotations(slug)`;

        console.log("✅ SUCCESS: Your Neon database is now 100% clean and ready!");
    } catch (e) {
        console.error("❌ ERROR: Database reset failed:", e);
    }
}

clearAndInit();
