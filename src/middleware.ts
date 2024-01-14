import { sql } from "@vercel/postgres";
import { compareSync } from "bcryptjs";
import { NextResponse, type NextRequest } from "next/server";

const unauthorized = () => new NextResponse(null, { status: 403 })

export async function middleware(request: NextRequest) {
  const id = request.headers.get("x-id");
  const authorization = request.headers.get("authorization");
  if (!authorization || !id) return unauthorized();

  const {
    rows: [row],
  } = await sql`SELECT (hash) FROM keys WHERE id = ${id} AND activated = true`;

  if (!row) return unauthorized();
  const valid = compareSync(authorization, row.hash);
  if (!valid) return unauthorized();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/artifacts/:path*"],
};
