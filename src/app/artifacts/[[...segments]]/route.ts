import { put,  } from "@vercel/blob";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export const PUT = async (request: NextRequest) => {  
  const destination = request.nextUrl.pathname.slice(1);
  const fileName = request.nextUrl.pathname.split("/").pop();

  if (!fileName) {
    return new Response(null, { status: 400 });
  }

  const chunks: BlobPart[] = [];
  const reader = await request.body?.getReader();

  const file = await reader
    ?.read()
    .then(async function process({ done, value }): Promise<File> {
      if (done) {
        const blob = new Blob(chunks, { type: "application/gzip" });
        const file = new File([blob], fileName, {
          type: "application/gzip",
        });
        return file;
      }

      chunks.push(value);
      return reader.read().then(process);
    });

  if (!file) {
    return new Response(null, { status: 400 });
  }

  const blob = await put(destination, file, { access: "public" });
  return Response.json(blob);
};
