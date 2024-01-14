import { sql } from "@vercel/postgres";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";

export const POST = async () => {
  const authorization = randomBytes(32).toString("base64");
  const hashed = await hash(authorization, 10);

  const {
    rows: [row],
  } = await sql`INSERT INTO keys (hash) VALUES (${hashed}) RETURNING id`;

  if (row) return Response.json({ id: row.id, authorization });
  return new Response(null, { status: 500 });
};
