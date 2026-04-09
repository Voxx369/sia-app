import { query } from "../config/db.js";

async function dump() {
  const { rows } = await query("SELECT id, title, format, zoom_meeting_id FROM courses");
  console.log("Total courses:", rows.length);
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}

dump();
