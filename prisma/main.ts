import { db } from '../src/lib/server/db';

console.log(await db.selectFrom('User').execute());
