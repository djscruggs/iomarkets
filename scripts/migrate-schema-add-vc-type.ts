import Database from "better-sqlite3";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath =
  process.env.DATABASE_PATH ||
  path.join(__dirname, "..", "db", "iomarkets.db");

console.log("Starting schema migration to add venture-capital type...");
console.log("Database:", dbPath);

const db = new Database(dbPath);

try {
  // Check current schema
  const tableInfo = db.pragma("table_info(investments)");
  const typeColumn = tableInfo.find((col: any) => col.name === "type");

  console.log("\nCurrent 'type' column info:");
  console.log(typeColumn);

  // Check if we need to migrate
  const checkConstraint = db
    .prepare(
      "SELECT sql FROM sqlite_master WHERE type='table' AND name='investments'"
    )
    .get() as { sql: string };

  if (checkConstraint.sql.includes("'venture-capital'")) {
    console.log("\n✅ Schema already includes 'venture-capital' type. No migration needed.");
    process.exit(0);
  }

  console.log("\n🔄 Migrating schema to add 'venture-capital' type...");

  const migrateSchema = db.transaction(() => {
    // Step 1: Create new table with updated CHECK constraint
    db.exec(`
      CREATE TABLE investments_new (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        sponsor TEXT NOT NULL,
        target_raise INTEGER NOT NULL,
        amount_raised INTEGER NOT NULL,
        image_url TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('real-estate', 'private-equity', 'venture-capital')),
        location TEXT,
        min_investment INTEGER NOT NULL,
        projected_return REAL NOT NULL,
        term TEXT NOT NULL,
        featured INTEGER DEFAULT 0 CHECK(featured IN (0, 1)),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        description TEXT
      );
    `);

    // Step 2: Copy all data from old table to new table
    db.exec(`
      INSERT INTO investments_new
      SELECT * FROM investments;
    `);

    // Step 3: Drop the old table
    db.exec(`DROP TABLE investments;`);

    // Step 4: Rename new table to investments
    db.exec(`ALTER TABLE investments_new RENAME TO investments;`);

    // Step 5: Recreate indexes if any existed
    // (Add any indexes that were on the original table)

    console.log("✅ Schema migrated successfully");
  });

  migrateSchema();

  // Verify the migration
  const newSchema = db
    .prepare(
      "SELECT sql FROM sqlite_master WHERE type='table' AND name='investments'"
    )
    .get() as { sql: string };

  console.log("\n✅ New schema:");
  console.log(newSchema.sql);

  const count = db.prepare("SELECT COUNT(*) as count FROM investments").get() as {
    count: number;
  };
  console.log(`\n✅ Total investments after migration: ${count.count}`);

} catch (error) {
  console.error("❌ Migration failed:", error);
  process.exit(1);
} finally {
  db.close();
}
