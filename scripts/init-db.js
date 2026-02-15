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

    // Create letters table (unified: static + generated)
    console.log('📝 Creating letters table...');
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS letters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipient TEXT NOT NULL,
        context TEXT NOT NULL,
        tone TEXT NOT NULL,
        letters TEXT NOT NULL,
        slug TEXT NOT NULL,
        source TEXT NOT NULL DEFAULT 'generated',
        title TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(recipient, slug)
      )
    `);
    console.log('✅ Letters table created successfully\n');

    console.log('📊 Creating letters indexes...');
    await turso.execute(`CREATE INDEX IF NOT EXISTS idx_letters_recipient ON letters(recipient)`);
    await turso.execute(`CREATE INDEX IF NOT EXISTS idx_letters_tone ON letters(tone)`);
    await turso.execute(`CREATE INDEX IF NOT EXISTS idx_letters_source ON letters(source)`);
    await turso.execute(`CREATE INDEX IF NOT EXISTS idx_letters_created_at ON letters(created_at)`);
    await turso.execute(`CREATE INDEX IF NOT EXISTS idx_letters_slug ON letters(slug)`);
    console.log('✅ Letters indexes created\n');

    // Add title column if it doesn't exist (for existing databases)
    console.log('📝 Adding title column if not exists...');
    try {
      await turso.execute(`ALTER TABLE letters ADD COLUMN title TEXT DEFAULT NULL`);
      console.log('✅ Title column added');
    } catch (e) {
      // Column already exists, ignore
      console.log('ℹ️  Title column already exists, skipping');
    }

    // Verify letters table structure
    console.log('🔍 Verifying letters table structure...');
    const lettersTableInfo = await turso.execute(`PRAGMA table_info(letters)`);
    console.log('Letters table columns:', lettersTableInfo.rows);

    console.log('\n✨ Database initialization complete!');
    console.log('\n📋 Summary:');
    console.log('   - Table: user_letters (legacy)');
    console.log('   - Table: letters (unified)');
    console.log('   - Indexes: recipient, tone, source, created_at, slug');
    console.log('   - Ready to store letters!\n');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();
