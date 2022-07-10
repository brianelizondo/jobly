"use strict";
/** Database setup for jobly. */
const { Client } = require("pg");
const { DB_USER, DB_PASS, getDatabaseUri } = require("./config");

let db;

if (process.env.NODE_ENV === "production") {
  db = new Client({
    user: DB_USER,
    password: DB_PASS,
    database: getDatabaseUri(),
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  db = new Client({
    user: DB_USER,
    password: DB_PASS,
    database: getDatabaseUri()
  });
}

db.connect();

module.exports = db;