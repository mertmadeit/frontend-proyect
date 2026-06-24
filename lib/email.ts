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
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:28px 0;border-collapse:separate;border-spacing:0;background:#f4f4f5;border:1px solid #e5e7eb;border-radius:12px;">
        ${details
          .map(
            ({ label, value }, index) => `
              <tr>
                <td style="padding:${index === 0 ? "20px 22px 10px" : "10px 22px"};font-size:12px;line-height:18px;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;vertical-align:top;">${escapeEmailHtml(label)}</td>
                <td align="right" style="padding:${index === 0 ? "20px 22px 10px" : "10px 22px"};font-size:14px;line-height:20px;color:#111827;font-weight:600;vertical-align:top;">${escapeEmailHtml(value)}</td>
              </tr>
            `,
          )
          .join("")}
        <tr><td colspan="2" style="height:10px;line-height:10px;">&nbsp;</td></tr>
      </table>
    `
    : "";

  const actionHtml = action
    ? `
      <table role="presentation" cellspacing="0" cellpadding="0" style="margin:30px 0;">
        <tr>
          <td style="border-radius:8px;background:#0a0a0a;">
            <a href="${escapeEmailHtml(action.url)}" style="display:inline-block;padding:14px 22px;font-size:14px;line-height:20px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;">${escapeEmailHtml(action.label)}</a>
          </td>
        </tr>
      </table>
    `
    : "";

  const noteHtml = note
    ? `<p style="margin:28px 0 0;padding-top:22px;border-top:1px solid #e5e7eb;font-size:13px;line-height:20px;color:#6b7280;">${escapeEmailHtml(note)}</p>`
    : "";

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeEmailHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f4f5;color:#111827;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeEmailHtml(previewText)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;background:#f4f4f5;">
      <tr>
        <td align="center" style="padding:34px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:620px;border-collapse:separate;border-spacing:0;">
            <tr>
              <td style="padding:22px 28px;background:#0a0a0a;border-radius:16px 16px 0 0;color:#ffffff;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="font-size:22px;line-height:24px;font-weight:700;letter-spacing:-0.04em;">∞&nbsp; Luminar</td>
                    <td align="right" style="font-size:10px;line-height:16px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.16em;">Curaduría fotográfica</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:42px 38px;background:#ffffff;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
                <p style="margin:0 0 12px;font-size:11px;line-height:16px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.14em;">${escapeEmailHtml(eyebrow)}</p>
                <h1 style="margin:0 0 24px;font-size:32px;line-height:38px;font-weight:700;letter-spacing:-0.04em;color:#111827;">${escapeEmailHtml(title)}</h1>
                <div style="font-size:15px;line-height:25px;color:#374151;">${contentHtml}</div>
                ${detailsHtml}
                ${actionHtml}
                ${noteHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:22px 28px;background:#ffffff;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 16px 16px;font-size:11px;line-height:18px;color:#9ca3af;">
                <strong style="color:#6b7280;">Luminar</strong> · Precisión para cada historia.<br>
                Este mensaje fue generado automáticamente; no es necesario responderlo.
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
