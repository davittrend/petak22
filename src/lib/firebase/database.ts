import { Database, getDatabase } from 'firebase/database';
import { app } from './init';

export const database: Database = getDatabase(app);
