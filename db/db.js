import sqlite3 from 'sqlite3';
import {open} from 'sqlite';
sqlite3.verbose();
const DB_SOURCE = "user.sqlite";
export const db = await open({
    filename: DB_SOURCE,
    driver: sqlite3.Database
  }).then((db) => {
    // do your thing
    let sql = `CREATE TABLE users (
        email text PRIMARY KEY,
        uuid text,
        protocol TEXT,
        flow TEXT DEFAULT 'TLS'
      );
`
    db.run(sql).catch((err)=> {});
    return db
  })
 
