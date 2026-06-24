import { betterAuth } from "better-auth";
import { createPool } from "mysql2/promise";
import { createAccessControl } from "better-auth/plugins/access";
import { admin } from "better-auth/plugins/admin";
import {
  escapeEmailHtml,
  renderLuminarEmail,
  sendEmail,
} from "@/lib/email";

const adminStatements = {
  user: [
    "create",
    "list",
    "set-role",
    "delete",
    "set-password",
    "set-email",
    "get",
    "update",
  ],
  session: ["list", "revoke", "delete"],
} as const;

const accessControl = createAccessControl(adminStatements);
const adminRole = accessControl.newRole(adminStatements);
const internalRole = accessControl.newRole({ user: [], session: [] });

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
  plugins: [
    admin({
      defaultRole: "empleado",
      adminRoles: ["admin"],
      ac: accessControl,
      roles: {
        admin: adminRole,
        supervisor: internalRole,
        empleado: internalRole,
      },
    }),
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Restablece tu contraseña | Luminar",
        html: renderLuminarEmail({
          previewText: "Usa este enlace seguro para crear una nueva contraseña.",
          eyebrow: "Seguridad de tu cuenta",
          title: "Restablece tu contraseña",
          contentHtml: `
            <p style="margin:0 0 16px;">Hola <strong style="color:#111827;">${escapeEmailHtml(user.name)}</strong>,</p>
            <p style="margin:0;">Recibimos una solicitud para cambiar la contraseña de tu cuenta Luminar. Usa el botón para elegir una nueva.</p>
          `,
          action: {
            label: "Crear nueva contraseña",
            url,
          },
          note: "Si no solicitaste este cambio, ignora este correo. Tu contraseña actual seguirá funcionando.",
        }),
        text: `Hola ${user.name}. Recibimos una solicitud para cambiar tu contraseña de Luminar. Abre este enlace: ${url}. Si no solicitaste el cambio, ignora este correo.`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Confirma tu correo y activa tu cuenta | Luminar",
        html: renderLuminarEmail({
          previewText: "Confirma tu correo para comenzar a usar Luminar.",
          eyebrow: "Bienvenido a Luminar",
          title: "Tu próxima historia comienza aquí",
          contentHtml: `
            <p style="margin:0 0 16px;">Hola <strong style="color:#111827;">${escapeEmailHtml(user.name)}</strong>,</p>
            <p style="margin:0;">Gracias por crear tu cuenta. Confirma tu correo para acceder al catálogo y administrar tu experiencia en Luminar.</p>
          `,
          action: {
            label: "Confirmar mi correo",
            url,
          },
          note: "Si no creaste esta cuenta, puedes ignorar este mensaje con tranquilidad.",
        }),
        text: `Hola ${user.name}. Gracias por crear tu cuenta Luminar. Confirma tu correo desde este enlace: ${url}`,
      });
    },
  },
});
