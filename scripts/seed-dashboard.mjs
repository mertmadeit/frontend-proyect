import "dotenv/config";
import { randomUUID } from "node:crypto";
import mysql from "mysql2/promise";
import { hashPassword } from "better-auth/crypto";

const demoEmail = process.env.DASHBOARD_DEMO_EMAIL ?? "demo@luminar.test";
const demoPassword =
  process.env.DASHBOARD_DEMO_PASSWORD ?? "LuminarDemo2026!";

const connection = await mysql.createConnection({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT || 3306),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

async function upsertBy(table, key, value, data) {
  const [rows] = await connection.query(
    `SELECT id FROM \`${table}\` WHERE \`${key}\` = ? LIMIT 1`,
    [value],
  );

  if (rows.length > 0) {
    if (Object.keys(data).length === 0) {
      return rows[0].id;
    }

    const assignments = Object.keys(data)
      .map((column) => `\`${column}\` = ?`)
      .join(", ");
    await connection.query(
      `UPDATE \`${table}\` SET ${assignments} WHERE id = ?`,
      [...Object.values(data), rows[0].id],
    );
    return rows[0].id;
  }

  const columns = [key, ...Object.keys(data)];
  const placeholders = columns.map(() => "?").join(", ");
  const [result] = await connection.query(
    `INSERT INTO \`${table}\` (${columns.map((column) => `\`${column}\``).join(", ")}) VALUES (${placeholders})`,
    [value, ...Object.values(data)],
  );
  return result.insertId;
}

try {
  await connection.beginTransaction();

  const products = [
    ["Sony Alpha 7 IV", 44999, 8],
    ["Sony Alpha 7S III", 67999, 4],
    ["Sigma 24-70mm f/2.8 DG DN II", 24999, 12],
    ["Sony FE 16-35mm F2.8 GM", 39999, 6],
    ["Sigma 105mm f/2.8 Macro", 17999, 3],
    ["RØDE Wireless GO II", 6999, 15],
    ["Trípode Rollei C6i", 4299, 9],
    ["Soporte profesional C-Stand", 5899, 2],
  ];

  for (const [nombre, precio, cantidad] of products) {
    await upsertBy("productos", "nombre", nombre, {
      precio,
      cantidad,
      updated_at: new Date(),
    });
  }

  const clients = [
    {
      nombre: "Mariana López",
      rfc: "LOPM900101T01",
      direccion: "Av. Reforma 120, CDMX",
      telefono: "5512345678",
      email: "mariana.lopez@example.test",
    },
    {
      nombre: "Estudio Norte",
      rfc: "ENO210315AB2",
      direccion: "Calz. Independencia 450, Guadalajara",
      telefono: "3312345678",
      email: "contacto@estudionorte.test",
    },
    {
      nombre: "Carlos Hernández",
      rfc: "HEGC880812QK4",
      direccion: "Av. Universidad 88, Monterrey",
      telefono: "8112345678",
      email: "carlos.hernandez@example.test",
    },
    {
      nombre: "Casa Productora Sur",
      rfc: "CPS190702L21",
      direccion: "Calle 60 245, Mérida",
      telefono: "9991234567",
      email: "produccion@casasur.test",
    },
  ];

  const clientIds = [];
  for (const client of clients) {
    const { email, ...data } = client;
    clientIds.push(
      await upsertBy("clientes", "email", email, {
        ...data,
        updated_at: new Date(),
      }),
    );
  }

  const cardId = await upsertBy("formaspago", "nombre", "Tarjeta", {});
  const transferId = await upsertBy(
    "formaspago",
    "nombre",
    "Transferencia",
    {},
  );
  const cashId = await upsertBy("formaspago", "nombre", "Efectivo", {});

  const paidId = await upsertBy(
    "estadosfacturas",
    "estado",
    "Pagada",
    {},
  );
  const pendingId = await upsertBy(
    "estadosfacturas",
    "estado",
    "Pendiente",
    {},
  );

  const adminProfileId = await upsertBy(
    "perfiles",
    "nombre",
    "Administrador",
    {},
  );
  const salesProfileId = await upsertBy(
    "perfiles",
    "nombre",
    "Ventas",
    {},
  );
  await upsertBy("perfiles", "nombre", "Almacén", {});

  const invoices = [
    [1001, "Sony Alpha 7 IV · 1 pieza", 44999, clientIds[0], cardId, paidId],
    [1002, "RØDE Wireless GO II · 2 piezas", 13998, clientIds[1], transferId, paidId],
    [1003, "Sigma 105mm Macro · 1 pieza", 17999, clientIds[2], cardId, pendingId],
    [1004, "Trípode Rollei C6i · 1 pieza", 4299, clientIds[3], cashId, paidId],
  ];

  for (const [numero, detalles, valor, idCliente, idforma, idestado] of invoices) {
    await upsertBy("facturas", "numero", numero, {
      detalles,
      valor,
      archivo: `factura-${numero}.pdf`,
      idCliente,
      idforma,
      idestado,
      updated_at: new Date(),
    });
  }

  const passwordHash = await hashPassword(demoPassword);

  await upsertBy("users", "email", "admin.dashboard@luminar.test", {
    name: "Administrador Demo",
    email_verified_at: new Date(),
    password: passwordHash,
    idperfil: adminProfileId,
    updated_at: new Date(),
  });
  await upsertBy("users", "email", "ventas.dashboard@luminar.test", {
    name: "Ventas Demo",
    email_verified_at: new Date(),
    password: passwordHash,
    idperfil: salesProfileId,
    updated_at: new Date(),
  });

  const [authUsers] = await connection.query(
    "SELECT id FROM `user` WHERE email = ? LIMIT 1",
    [demoEmail],
  );
  const authUserId = authUsers[0]?.id ?? randomUUID();

  if (authUsers.length > 0) {
    await connection.query(
      "UPDATE `user` SET name = ?, emailVerified = 1, updatedAt = NOW(3) WHERE id = ?",
      ["Usuario Demo Luminar", authUserId],
    );
  } else {
    await connection.query(
      "INSERT INTO `user` (id, name, email, emailVerified, createdAt, updatedAt) VALUES (?, ?, ?, 1, NOW(3), NOW(3))",
      [authUserId, "Usuario Demo Luminar", demoEmail],
    );
  }

  const [authAccounts] = await connection.query(
    "SELECT id FROM account WHERE userId = ? AND providerId = 'credential' LIMIT 1",
    [authUserId],
  );

  if (authAccounts.length > 0) {
    await connection.query(
      "UPDATE account SET password = ?, updatedAt = NOW(3) WHERE id = ?",
      [passwordHash, authAccounts[0].id],
    );
  } else {
    await connection.query(
      "INSERT INTO account (id, accountId, providerId, userId, password, createdAt, updatedAt) VALUES (?, ?, 'credential', ?, ?, NOW(3), NOW(3))",
      [randomUUID(), authUserId, authUserId, passwordHash],
    );
  }

  await connection.commit();

  console.log("Datos de prueba creados correctamente.");
  console.log(`Correo demo: ${demoEmail}`);
  console.log(`Contraseña demo: ${demoPassword}`);
} catch (error) {
  await connection.rollback();
  console.error(error);
  process.exitCode = 1;
} finally {
  await connection.end();
}
