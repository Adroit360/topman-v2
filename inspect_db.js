const mysql = require('mysql2/promise');
const url = "mysql://databases_albert:stayReady;@12@92.205.232.136:3306/databases_topmanfeb";

async function run() {
  let connection;
  try {
    connection = await mysql.createConnection(url);
    
    console.log("--- Books Table Structure ---");
    const [columns] = await connection.query("DESCRIBE books");
    console.log(columns.map(c => ({ Field: c.Field, Type: c.Type })));

    console.log("\n--- Drizzle Migrations ---");
    const [migrations] = await connection.query("SELECT * FROM __drizzle_migrations ORDER BY id ASC");
    console.log(migrations);

  } catch (err) {
    console.error(err);
  } finally {
    if (connection) await connection.end();
  }
}

run();
