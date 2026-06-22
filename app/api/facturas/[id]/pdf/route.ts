import { auth } from "@/lib/auth";
import { buildBackendUrl, getBackendApiKey } from "@/lib/backend";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return Response.json({ message: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;
  if (!/^\d+$/.test(id) || Number(id) < 1) {
    return Response.json({ message: "Factura invalida." }, { status: 400 });
  }

  const backendResponse = await fetch(buildBackendUrl(`/facturas/${id}/pdf`), {
    method: "GET",
    headers: {
      "X-API-Key": getBackendApiKey(),
    },
    cache: "no-store",
  });

  const headers = new Headers();
  const contentType = backendResponse.headers.get("content-type");
  const contentDisposition = backendResponse.headers.get("content-disposition");

  if (contentType) {
    headers.set("content-type", contentType);
  }

  if (contentDisposition) {
    headers.set("content-disposition", contentDisposition);
  }

  if (!backendResponse.ok) {
    const message = await backendResponse.text();
    return new Response(message || "No fue posible descargar la factura.", {
      status: backendResponse.status,
      headers,
    });
  }

  return new Response(await backendResponse.arrayBuffer(), {
    status: backendResponse.status,
    headers,
  });
}
