import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const path = require('path');
const dbPath = path.resolve(__dirname, '..', 'sqlite.db');
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });
