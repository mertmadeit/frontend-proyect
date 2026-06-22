import { betterAuth } from "better-auth";
import { createPool } from "mysql2/promise";
import { sendEmail } from "@/lib/email";
import { normalizeUserRole } from "@/lib/roles";

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character]!,
  );
}

export const auth = betterAuth({
  appName: "Luminar",
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  database: createPool({
    host: process.env.DATABASE_HOST!,
    port: Number(process.env.DATABASE_PORT || 3306),
    user: process.env.DATABASE_USER!,
    password: process.env.DATABASE_PASSWORD!,
    database: process.env.DATABASE_NAME!,
    timezone: "Z",
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "supervisor",
        input: true,
        transform: {
          input: normalizeUserRole,
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Restablecer contraseña - Luminar",
        html: `
          <h1>Restablecer contraseña</h1>
          <p>Hola ${escapeHtml(user.name)}, recibimos una solicitud para cambiar tu contraseña.</p>
          <p>Da clic en el siguiente enlace:</p>
          <a href="${escapeHtml(url)}">Restablecer contraseña</a>
          <p>Si tú no solicitaste esto, puedes ignorar este correo.</p>
        `,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verifica tu cuenta - Luminar",
        html: `
          <h1>Bienvenido a Luminar</h1>
          <p>Hola ${escapeHtml(user.name)}, gracias por registrarte.</p>
          <p>Para activar tu cuenta, da clic en el siguiente enlace:</p>
          <a href="${escapeHtml(url)}">Verificar cuenta</a>
        `,
      });
    },
  },
});
