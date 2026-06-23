"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  escapeEmailHtml,
  renderLuminarEmail,
  sendEmail,
} from "@/lib/email";

import { apiFetch } from "@/lib/api";
import {
  normalizeUserRole,
  USER_ROLES,
  type UserRole,
} from "@/lib/roles";

export type ActionResult = {
  ok: boolean;
  message: string;
};

async function requireSession(allowedRoles: readonly UserRole[] = USER_ROLES) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  if (!allowedRoles.includes(normalizeUserRole(session.user.role))) {
    redirect("/dashboard?seccion=facturas");
  }

  return session;
}

function requiredText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function positiveInteger(formData: FormData, key: string) {
  const value = Number(formData.get(key));
  return Number.isInteger(value) && value > 0 ? value : 0;
}

function optionalId(formData: FormData) {
  const value = Number(formData.get("id"));
  return Number.isInteger(value) && value > 0 ? value : undefined;
}

function failure(error: unknown, fallback: string): ActionResult {
  console.error(error);
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message: string }).message)
      : "";

  if (message.includes("constraint") || message.includes("foreign")) {
    return {
      ok: false,
      message: "No se puede eliminar porque el registro está siendo utilizado.",
    };
  }

  return { ok: false, message: fallback };
}

function productFrom(formData: FormData) {
  return {
    nombre: requiredText(formData, "nombre"),
    precio: Number(formData.get("precio")),
    cantidad: Number(formData.get("cantidad")),
  };
}

function validProduct(producto: ReturnType<typeof productFrom>) {
  return (
    producto.nombre.length > 0 &&
    Number.isInteger(producto.precio) &&
    producto.precio >= 0 &&
    Number.isInteger(producto.cantidad) &&
    producto.cantidad >= 0
  );
}

async function request(path: string, init: RequestInit) {
  const response = await apiFetch(path, init);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
}

export async function crearProducto(
  formData: FormData,
): Promise<ActionResult> {
  await requireSession(["admin"]);
  const producto = productFrom(formData);

  if (!validProduct(producto)) {
    return {
      ok: false,
      message: "Completa los datos del producto correctamente.",
    };
  }

  try {
    await request("/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(producto),
    });
    revalidatePath("/");
    revalidatePath("/dashboard");
    return { ok: true, message: "Producto agregado." };
  } catch (error) {
    return failure(error, "No fue posible agregar el producto.");
  }
}

export async function eliminarProducto(id: number): Promise<ActionResult> {
  await requireSession(["admin"]);

  try {
    await request(`/productos/${id}`, { method: "DELETE" });
    revalidatePath("/");
    revalidatePath("/dashboard");
    return { ok: true, message: "Producto eliminado." };
  } catch (error) {
    return failure(error, "No fue posible eliminar el producto.");
  }
}

export async function actualizarProducto(formData: FormData) {
  await requireSession(["admin"]);
  const id = Number(formData.get("id"));
  const producto = productFrom(formData);

  if (!Number.isInteger(id) || id <= 0 || !validProduct(producto)) {
    throw new Error("Datos de producto no válidos");
  }

  await request(`/productos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(producto),
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function guardarCliente(formData: FormData): Promise<ActionResult> {
  await requireSession(["admin"]);

  const id = optionalId(formData);
  const nombre = requiredText(formData, "nombre");
  const rfc = requiredText(formData, "rfc").toUpperCase();
  const direccion = requiredText(formData, "direccion");
  const telefono = requiredText(formData, "telefono");
  const email = requiredText(formData, "email").toLowerCase();

  if (!nombre || !rfc || !direccion || !telefono || !email) {
    return { ok: false, message: "Completa todos los campos del cliente." };
  }

  try {
    const body = { nombre, rfc, direccion, telefono, email };

    if (id) {
      const res = await apiFetch(`/clientes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
    } else {
      const res = await apiFetch(`/clientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
    }

    revalidatePath("/dashboard");
    return { ok: true, message: id ? "Cliente actualizado." : "Cliente agregado." };
  } catch (error) {
    return failure(error, "No fue posible guardar el cliente.");
  }
}

export async function eliminarCliente(id: number): Promise<ActionResult> {
  await requireSession(["admin"]);

  try {
    const res = await apiFetch(`/clientes/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    revalidatePath("/dashboard");
    return { ok: true, message: "Cliente eliminado." };
  } catch (error) {
    return failure(error, "No fue posible eliminar el cliente.");
  }
}

export async function guardarFactura(formData: FormData): Promise<ActionResult> {
  const session = await requireSession();

  const id = optionalId(formData);
  const numero = positiveInteger(formData, "numero");
  const valor = positiveInteger(formData, "valor");
  const idCliente = positiveInteger(formData, "idCliente");
  const idforma = positiveInteger(formData, "idforma");
  const idestado = positiveInteger(formData, "idestado");
  const detalles = requiredText(formData, "detalles");

  if (
    !numero ||
    !valor ||
    !idCliente ||
    !idforma ||
    !idestado ||
    !detalles
  ) {
    return { ok: false, message: "Completa todos los campos de la factura." };
  }

  // Check for duplicate invoice number
  const dupRes = await apiFetch(`/facturas/check-duplicate?numero=${numero}${id ? `&excludeId=${id}` : ""}`);
  if (!dupRes.ok) {
    return { ok: false, message: "No fue posible validar el número de factura." };
  }
  const dupData = await dupRes.json();
  if (dupData.exists) {
    return { ok: false, message: "Ya existe una factura con ese número." };
  }

  const body = {
    numero,
    valor,
    idCliente,
    idforma,
    idestado,
    detalles,
  };

  try {
    if (id) {
      const res = await apiFetch(`/facturas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
    } else {
      const res = await apiFetch(`/facturas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);

      const formatoPrecio = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      });

      sendEmail({
        to: session.user.email,
        subject: `Factura #${numero} registrada | Luminar`,
        html: renderLuminarEmail({
          previewText: `La factura #${numero} se registró correctamente en Luminar.`,
          eyebrow: "Confirmación del panel",
          title: "Factura registrada",
          contentHtml: `
            <p style="margin:0 0 16px;">Hola <strong style="color:#111827;">${escapeEmailHtml(session.user.name)}</strong>,</p>
            <p style="margin:0;">La nueva factura se guardó correctamente y ya está disponible en el panel de Luminar.</p>
          `,
          details: [
            { label: "Folio", value: `#${numero}` },
            { label: "Valor total", value: formatoPrecio.format(valor) },
            { label: "Detalles", value: detalles },
          ],
          note: "Puedes consultar o descargar el documento desde la sección de facturas del panel.",
        }),
        text: `Hola ${session.user.name}. La factura #${numero} se registró correctamente en Luminar. Total: ${formatoPrecio.format(valor)}. Detalles: ${detalles}.`,
      }).catch(console.error);
    }

    revalidatePath("/dashboard");
    return { ok: true, message: id ? "Factura actualizada." : "Factura agregada." };
  } catch (error) {
    return failure(error, "No fue posible guardar la factura.");
  }
}

export async function eliminarFactura(id: number): Promise<ActionResult> {
  await requireSession();

  try {
    const res = await apiFetch(`/facturas/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    revalidatePath("/dashboard");
    return { ok: true, message: "Factura eliminada." };
  } catch (error) {
    return failure(error, "No fue posible eliminar la factura.");
  }
}

export async function guardarPerfil(formData: FormData): Promise<ActionResult> {
  await requireSession(["admin"]);

  const id = optionalId(formData);
  const nombre = requiredText(formData, "nombre");

  if (!nombre) {
    return { ok: false, message: "Escribe el nombre del perfil." };
  }

  try {
    if (id) {
      const res = await apiFetch(`/perfiles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
    } else {
      const res = await apiFetch(`/perfiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
    }

    revalidatePath("/dashboard");
    return { ok: true, message: id ? "Perfil actualizado." : "Perfil agregado." };
  } catch (error) {
    return failure(error, "No fue posible guardar el perfil.");
  }
}

export async function eliminarPerfil(id: number): Promise<ActionResult> {
  await requireSession(["admin"]);

  try {
    const res = await apiFetch(`/perfiles/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    revalidatePath("/dashboard");
    return { ok: true, message: "Perfil eliminado." };
  } catch (error) {
    return failure(error, "No fue posible eliminar el perfil.");
  }
}
