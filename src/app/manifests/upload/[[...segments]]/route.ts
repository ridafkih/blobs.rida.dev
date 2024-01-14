import { sql } from "@vercel/postgres"
import type { NextRequest } from "next/server";

export const runtime = "edge";

export const PUT = async (request: NextRequest) => {  
  const destination = request.nextUrl.pathname.split("/").slice(3).join("/")

  const contentType = request.headers.get('content-type')
  if (contentType !== 'application/json') {
    return new Response(null, { status: 400 })
  }

  const body = await request.json()
  if (!body) {
    return new Response(null, { status: 400 })
  }

  const { rows: [row] } =
    await sql`INSERT INTO manifests (destination, body) VALUES (${destination}, ${body}) ON CONFLICT (destination) DO UPDATE SET body = ${body} RETURNING *;`

  if (!row) return new Response(null, { status: 500 })
  
  return Response.json({ destination })
};
