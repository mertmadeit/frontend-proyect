import "server-only";

import { Resend } from "resend";

let resend: Resend | null = null;

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

type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const client = getResendClient();

  await client.emails.send({
    from: process.env.EMAIL_FROM || "CamStore <onboarding@resend.dev>",
    to,
    subject,
    html,
  });
}
