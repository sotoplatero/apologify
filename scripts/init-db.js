import { createClient } from "@libsql/client/web";
import 'dotenv/config';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function initDatabase() {
  console.log('🚀 Initializing Turso database...\n');

  try {
    // Create user_letters table
    console.log('📝 Creating user_letters table...');
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS user_letters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipient TEXT NOT NULL,
        context TEXT NOT NULL,
        tone TEXT NOT NULL,
        letter TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table created successfully\n');

    // Create indexes
    console.log('📊 Creating indexes...');
    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_recipient ON user_letters(recipient)
    `);
    console.log('✅ Index on recipient created');

    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_tone ON user_letters(tone)
    `);
    console.log('✅ Index on tone created');

    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_created_at ON user_letters(created_at)
    `);
    console.log('✅ Index on created_at created\n');

    // Verify table structure
    console.log('🔍 Verifying table structure...');
    const tableInfo = await turso.execute(`
      PRAGMA table_info(user_letters)
    `);
    console.log('Table columns:', tableInfo.rows);

    console.log('\n✨ Database initialization complete!');
    console.log('\n📋 Summary:');
    console.log('   - Table: user_letters');
    console.log('   - Indexes: recipient, tone, created_at');
    console.log('   - Ready to store generated letters!\n');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();
