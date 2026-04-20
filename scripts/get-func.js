const { Client } = require('pg');
require('dotenv').config();
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
client.connect().then(() => {
  return client.query(`
    SELECT proname, pg_get_function_identity_arguments(oid) as args
    FROM pg_proc 
    WHERE proname = 'handle_new_user'
  `);
}).then(res => {
  console.log(res.rows);
  client.end();
}).catch(console.error);
