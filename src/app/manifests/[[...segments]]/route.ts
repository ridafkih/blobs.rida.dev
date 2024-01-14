import { sql } from "@vercel/postgres";
import type { NextRequest } from "next/server";

export const runtime = "edge";
export const fetchCache = 'force-no-store';

export const GET = async (request: NextRequest) => {
  const destination = request.nextUrl.pathname.split("/").slice(2).join("/");
  console.log({ destination})

  const {
    rows: [row],
  } = await sql`SELECT * FROM manifests WHERE destination = ${destination}`;
  
  if (!row) return new Response(null, { status: 404 });

  return Response.json(row.body)
}