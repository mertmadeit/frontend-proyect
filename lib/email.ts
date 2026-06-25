import "server-only";

import { Resend } from "resend";

let resend: Resend | null = null;
const DEFAULT_EMAIL_FROM = "Luminar <noreply@mertmadeit.xyz>";

function getResendClient() {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error("RESEND_API_KEY is required to send email");
    }

    resend = new Resend(apiKey);
  }

  return resend;
}

function getEmailFrom() {
  const configuredFrom =
    process.env.EMAIL_FROM?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "";

  if (!configuredFrom || /@(?:onboarding\.)?resend\.dev\b/i.test(configuredFrom)) {
    return DEFAULT_EMAIL_FROM;
  }

  return configuredFrom;
}

type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
};

type LuminarEmailOptions = {
  previewText: string;
  eyebrow: string;
  title: string;
  contentHtml: string;
  action?: {
    label: string;
    url: string;
  };
  details?: Array<{
    label: string;
    value: string;
  }>;
  note?: string;
};

export function escapeEmailHtml(value: string) {
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

export function renderLuminarEmail({
  previewText,
  eyebrow,
  title,
  contentHtml,
  action,
  details = [],
  note,
}: LuminarEmailOptions) {
  const detailsHtml = details.length
    ? `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:28px 0;border-collapse:separate;border-spacing:0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
        ${details
          .map(
            ({ label, value }, index) => {
              const borderStyle = index > 0 ? "border-top:1px solid #e2e8f0;" : "";
              return `
                <tr>
                  <td style="padding:16px 20px;font-size:11px;line-height:18px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;vertical-align:top;${borderStyle}">${escapeEmailHtml(label)}</td>
                  <td align="right" style="padding:16px 20px;font-size:14px;line-height:20px;color:#0f172a;font-weight:700;vertical-align:top;${borderStyle}">${escapeEmailHtml(value)}</td>
                </tr>
              `;
            }
          )
          .join("")}
      </table>
    `
    : "";

  const actionHtml = action
    ? `
      <table role="presentation" cellspacing="0" cellpadding="0" style="margin:30px 0;">
        <tr>
          <td style="border-radius:8px;background:#0f172a;box-shadow:0 2px 4px rgba(15,23,42,0.15);">
            <a href="${escapeEmailHtml(action.url)}" style="display:inline-block;padding:14px 26px;font-size:14px;line-height:20px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;letter-spacing:-0.01em;">${escapeEmailHtml(action.label)}</a>
          </td>
        </tr>
      </table>
    `
    : "";

  const noteHtml = note
    ? `<p style="margin:28px 0 0;padding-top:22px;border-top:1px solid #e2e8f0;font-size:13px;line-height:20px;color:#64748b;">${escapeEmailHtml(note)}</p>`
    : "";

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeEmailHtml(title)}</title>
    <style type="text/css">
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
      body, table, td, a {
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#f9fafb;color:#1e293b;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeEmailHtml(previewText)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;background:#f9fafb;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;border-collapse:separate;border-spacing:0;box-shadow:0 4px 24px rgba(0,0,0,0.02);border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:26px 32px;background:#0f172a;color:#ffffff;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="font-size:22px;line-height:24px;font-weight:700;letter-spacing:-0.04em;color:#ffffff;">∞&nbsp; Luminar</td>
                    <td align="right" style="font-size:9px;line-height:16px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.16em;font-weight:600;">Curaduría fotográfica</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:44px 40px;background:#ffffff;">
                <p style="margin:0 0 12px;font-size:11px;line-height:16px;font-weight:700;color:#d97706;text-transform:uppercase;letter-spacing:0.14em;">${escapeEmailHtml(eyebrow)}</p>
                <h1 style="margin:0 0 24px;font-size:28px;line-height:34px;font-weight:700;letter-spacing:-0.04em;color:#0f172a;">${escapeEmailHtml(title)}</h1>
                <div style="font-size:15px;line-height:26px;color:#334155;">${contentHtml}</div>
                ${detailsHtml}
                ${actionHtml}
                ${noteHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:22px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:11px;line-height:18px;color:#94a3b8;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td>
                      <strong style="color:#64748b;">Luminar</strong> · Precisión para cada historia.<br>
                      Este mensaje fue generado automáticamente; no es necesario responderlo.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  attachments,
}: SendEmailOptions) {
  const client = getResendClient();

  const { error } = await client.emails.send({
    from: getEmailFrom(),
    to,
    subject,
    html,
    text,
    attachments,
  });

  if (error) {
    throw new Error(`No fue posible enviar el correo: ${error.message}`);
  }
}
