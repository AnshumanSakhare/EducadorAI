
import sql from '../lib/db.ts';

async function setupDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS Documents (
        id SERIAL PRIMARY KEY,
        file_name TEXT NOT NULL,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS Analyses (
        id SERIAL PRIMARY KEY,
        file_name TEXT NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Database setup complete. "Documents" table created.');
  } catch (error) {
    console.error('Error setting up the database:', error);
  }
}

setupDatabase();
