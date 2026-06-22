import "server-only";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM || "CamStore <onboarding@resend.dev>",
    to,
    subject,
    html,
  });
}
