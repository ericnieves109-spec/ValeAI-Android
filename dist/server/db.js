import path from "path";
const DATA_DIR = process.env.DATA_DIRECTORY || path.join(process.cwd(), "data");
const dbPath = path.join(DATA_DIR, "database.sqlite");
//export const db = new Kysely<Database>({
//  log: ["query", "error"]
//});
