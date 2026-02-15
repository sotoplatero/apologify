import { createClient } from "@libsql/client/web";
import OpenAI from 'openai';
import 'dotenv/config';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DRY_RUN = process.argv.includes('--dry-run');
const DELAY_MS = 500; // delay between API calls

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateTitle(recipient, context) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content: 'You generate concise titles for apology letters. Respond with ONLY the title, nothing else. No quotes, no punctuation at the end.'
      },
      {
        role: 'user',
        content: `Generate a concise 5-10 word title in gerund/noun form for this apology to a ${recipient}. The situation: ${context}\n\nExamples of good titles: "Forgetting Your Birthday", "Being Late to the Meeting", "Breaking a Promise About Our Vacation"\n\nTitle:`
      }
    ],
    temperature: 0.3,
    max_tokens: 50,
  });

  return completion.choices[0].message.content.trim();
}

async function migrate() {
  console.log(DRY_RUN ? '🔍 DRY RUN MODE - No changes will be made\n' : '🚀 Starting title migration...\n');

  // Get all letters without a title
  const result = await turso.execute('SELECT id, recipient, context FROM letters WHERE title IS NULL');
  const rows = result.rows;

  console.log(`Found ${rows.length} letters without titles\n`);

  if (rows.length === 0) {
    console.log('Nothing to migrate!');
    return;
  }

  let success = 0;
  let errors = 0;

  for (const row of rows) {
    try {
      const title = await generateTitle(row.recipient, row.context);
      console.log(`[${row.id}] ${row.recipient} | "${row.context.substring(0, 50)}..." → "${title}"`);

      if (!DRY_RUN) {
        await turso.execute({
          sql: 'UPDATE letters SET title = ? WHERE id = ?',
          args: [title, row.id]
        });
      }

      success++;
      await sleep(DELAY_MS);
    } catch (error) {
      console.error(`[${row.id}] ERROR: ${error.message}`);
      errors++;
    }
  }

  console.log(`\n✅ Done! ${success} titles generated, ${errors} errors`);
  if (DRY_RUN) {
    console.log('ℹ️  Run without --dry-run to apply changes');
  }
}

migrate().catch(console.error);
