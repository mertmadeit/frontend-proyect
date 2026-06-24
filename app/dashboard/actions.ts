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

import { apiFetch, apiFetchForRole, apiFetchJson } from "@/lib/api";
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

async function request(path: string, init: RequestInit, role: unknown) {
  const response = await apiFetchForRole(path, role, init);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
}

export async function crearProducto(
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireSession(["admin"]);
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
    }, session.user.role);
    revalidatePath("/");
    revalidatePath("/dashboard");
    return { ok: true, message: "Producto agregado." };
  } catch (error) {
    return failure(error, "No fue posible agregar el producto.");
  }
}

export async function eliminarProducto(id: number): Promise<ActionResult> {
  const session = await requireSession(["admin"]);

  try {
    await request(`/productos/${id}`, { method: "DELETE" }, session.user.role);
    revalidatePath("/");
    revalidatePath("/dashboard");
    return { ok: true, message: "Producto eliminado." };
  } catch (error) {
    return failure(error, "No fue posible eliminar el producto.");
  }
}

export async function actualizarProducto(formData: FormData) {
  const session = await requireSession(["admin"]);
  const id = Number(formData.get("id"));
  const producto = productFrom(formData);

  if (!Number.isInteger(id) || id <= 0 || !validProduct(producto)) {
    throw new Error("Datos de producto no válidos");
  }

  await request(`/productos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(producto),
  }, session.user.role);

  revalidatePath("/");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function guardarCliente(formData: FormData): Promise<ActionResult> {
  const session = await requireSession(["admin"]);

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
      const res = await apiFetchForRole(`/clientes/${id}`, session.user.role, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
    } else {
      const res = await apiFetchForRole(`/clientes`, session.user.role, {
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
  const session = await requireSession(["admin"]);

  try {
    const res = await apiFetchForRole(`/clientes/${id}`, session.user.role, {
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
  const session = await requireSession(["admin", "supervisor"]);

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

  let cliente: { nombre: string; email: string };
  try {
    cliente = await apiFetchJson<{ nombre: string; email: string }>(
      `/clientes/${idCliente}`,
    );
  } catch (error) {
    return failure(error, "No fue posible encontrar al cliente de la factura.");
  }

  try {
    if (id) {
      const res = await apiFetchForRole(`/facturas/${id}`, session.user.role, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
    } else {
      const res = await apiFetchForRole(`/facturas`, session.user.role, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);

      const facturaCreada = (await res.json()) as { id?: number };
      if (!cliente.email) {
        return {
          ok: true,
          message: "Factura agregada, pero el cliente no tiene correo registrado.",
        };
      }

      const formatoPrecio = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      });

      let attachments:
        | Array<{ filename: string; content: Buffer; contentType: string }>
        | undefined;

      if (facturaCreada.id) {
        const pdfResponse = await apiFetch(`/facturas/${facturaCreada.id}/pdf`);
        if (pdfResponse.ok) {
          attachments = [
            {
              filename: `factura-${numero}.pdf`,
              content: Buffer.from(await pdfResponse.arrayBuffer()),
              contentType: "application/pdf",
            },
          ];
        }
      }

      try {
        await sendEmail({
          to: cliente.email,
          subject: `Tu factura #${numero} | Luminar`,
          html: renderLuminarEmail({
            previewText: `Tu factura #${numero} de Luminar ya está disponible.`,
            eyebrow: "Comprobante de compra",
            title: "Tu factura está lista",
            contentHtml: `
              <p style="margin:0 0 16px;">Hola <strong style="color:#111827;">${escapeEmailHtml(cliente.nombre)}</strong>,</p>
              <p style="margin:0;">Gracias por tu compra. Te enviamos la factura asociada a tu registro de cliente en Luminar.</p>
            `,
            details: [
              { label: "Folio", value: `#${numero}` },
              { label: "Valor total", value: formatoPrecio.format(valor) },
              { label: "Detalles", value: detalles },
            ],
            note: attachments
              ? "Encontrarás el documento PDF adjunto a este correo."
              : "El comprobante quedó registrado correctamente en Luminar.",
          }),
          text: `Hola ${cliente.nombre}. Te enviamos tu factura #${numero} de Luminar. Total: ${formatoPrecio.format(valor)}. Detalles: ${detalles}.`,
          attachments,
        });
      } catch (error) {
        console.error(error);
        revalidatePath("/dashboard");
        return {
          ok: true,
          message:
            "Factura agregada, pero no fue posible enviarla al correo del cliente.",
        };
      }
    }

    revalidatePath("/dashboard");
    return { ok: true, message: id ? "Factura actualizada." : "Factura agregada." };
  } catch (error) {
    return failure(error, "No fue posible guardar la factura.");
  }
}

export async function eliminarFactura(id: number): Promise<ActionResult> {
  const session = await requireSession(["admin", "supervisor"]);

  try {
    const res = await apiFetchForRole(`/facturas/${id}`, session.user.role, {
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
  const session = await requireSession(["admin"]);

  const id = optionalId(formData);
  const nombre = requiredText(formData, "nombre");

  if (!nombre) {
    return { ok: false, message: "Escribe el nombre del perfil." };
  }

  try {
    if (id) {
      const res = await apiFetchForRole(`/perfiles/${id}`, session.user.role, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
    } else {
      const res = await apiFetchForRole(`/perfiles`, session.user.role, {
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
  const session = await requireSession(["admin"]);

  try {
    const res = await apiFetchForRole(`/perfiles/${id}`, session.user.role, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    revalidatePath("/dashboard");
    return { ok: true, message: "Perfil eliminado." };
  } catch (error) {
    return failure(error, "No fue posible eliminar el perfil.");
  }
}

export async function guardarUsuario(formData: FormData): Promise<ActionResult> {
  const session = await requireSession(["admin"]);
  const requestHeaders = await headers();
  const id = requiredText(formData, "id");
  const name = requiredText(formData, "name");
  const email = requiredText(formData, "email").toLowerCase();
  const password = requiredText(formData, "password");
  const role = normalizeUserRole(requiredText(formData, "role"));

  if (!name || !email || !email.includes("@")) {
    return { ok: false, message: "Escribe un nombre y un correo válidos." };
  }

  if (!id && password.length < 8) {
    return {
      ok: false,
      message: "La contraseña debe tener al menos 8 caracteres.",
    };
  }

  if (id === session.user.id && role !== "admin") {
    return {
      ok: false,
      message: "No puedes quitarte tu propio acceso de administrador.",
    };
  }

  try {
    if (id) {
      await auth.api.adminUpdateUser({
        body: { userId: id, data: { name, email } },
        headers: requestHeaders,
      });
      await auth.api.setRole({
        body: { userId: id, role },
        headers: requestHeaders,
      });

      if (password) {
        if (password.length < 8) {
          return {
            ok: false,
            message: "La nueva contraseña debe tener al menos 8 caracteres.",
          };
        }
        await auth.api.setUserPassword({
          body: { userId: id, newPassword: password },
          headers: requestHeaders,
        });
      }
    } else {
      await auth.api.createUser({
        body: {
          name,
          email,
          password,
          role,
          data: { emailVerified: true },
        },
        headers: requestHeaders,
      });
    }

    revalidatePath("/dashboard");
    return {
      ok: true,
      message: id ? "Usuario actualizado." : "Usuario creado.",
    };
  } catch (error) {
    return failure(error, "No fue posible guardar el usuario.");
  }
}

export async function eliminarUsuario(id: string): Promise<ActionResult> {
  const session = await requireSession(["admin"]);

  if (!id || id === session.user.id) {
    return {
      ok: false,
      message: "No puedes eliminar tu propia cuenta de administrador.",
    };
  }

  try {
    await auth.api.removeUser({
      body: { userId: id },
      headers: await headers(),
    });
    revalidatePath("/dashboard");
    return { ok: true, message: "Usuario eliminado." };
  } catch (error) {
    return failure(error, "No fue posible eliminar el usuario.");
  }
}
