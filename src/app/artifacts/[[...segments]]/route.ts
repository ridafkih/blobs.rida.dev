import { put } from "@vercel/blob";
import { handleUpload } from "@vercel/blob/client";
import { type NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export const POST = async (request: NextRequest): Promise<NextResponse> => {
  const destination = request.nextUrl.pathname.split("/").slice(1).join("/");
 
  try {
    const jsonResponse = await handleUpload({
      body: {
        type: "blob.generate-client-token",
        payload: {
          pathname: destination,
          callbackUrl: "",
          multipart: false,
          clientPayload: null,
        }
      },
      request,
      onBeforeGenerateToken: async (
        pathname: string,
      ) => { 
        return {
          tokenPayload: JSON.stringify({
            pathname,
            "x-id": request.headers.get("x-id"),
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {},
    });
 
    if (!("clientToken" in jsonResponse)) return new NextResponse(null, { status: 400 });
    return new NextResponse(jsonResponse.clientToken);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}

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
        const blob = new Blob(chunks);
        const file = new File([blob], fileName);
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
