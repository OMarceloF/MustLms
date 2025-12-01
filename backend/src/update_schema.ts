import pool from './config/db';

async function updateSchema() {
  const conn = await pool.getConnection();
  try {
    console.log("Starting schema update...");

    // Check if 'url' column exists in 'atividade_url'
    const [urlColumns] = await conn.query<any[]>(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_NAME = 'atividade_url' AND COLUMN_NAME = 'url' AND TABLE_SCHEMA = DATABASE()
    `);

    if (urlColumns.length === 0) {
      console.log("Adding 'url' column to 'atividade_url'...");
      await conn.query(`ALTER TABLE atividade_url ADD COLUMN url TEXT`);
      console.log("'url' column added.");
    } else {
      console.log("'url' column already exists in 'atividade_url'.");
    }

    // Check if 'arquivo' column exists in 'atividade_arquivo'
    const [arquivoColumns] = await conn.query<any[]>(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_NAME = 'atividade_arquivo' AND COLUMN_NAME = 'arquivo' AND TABLE_SCHEMA = DATABASE()
    `);

    if (arquivoColumns.length === 0) {
      console.log("Adding 'arquivo' column to 'atividade_arquivo'...");
      await conn.query(`ALTER TABLE atividade_arquivo ADD COLUMN arquivo TEXT`);
      console.log("'arquivo' column added.");
    } else {
      console.log("'arquivo' column already exists in 'atividade_arquivo'.");
    }

    console.log("Schema update completed successfully.");

  } catch (error) {
    console.error("Error updating schema:", error);
  } finally {
    conn.release();
    process.exit();
  }
}

updateSchema();
