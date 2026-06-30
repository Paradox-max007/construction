// Email utility for BuildCraft.
// Uses Nodemailer when SMTP env vars are set; otherwise logs to console (dev fallback).

import nodemailer, { type Transporter } from "nodemailer";
import { db } from "@/lib/db";

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
};

function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return { host, port, user, pass };
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const cfg = getSmtpConfig();
  if (!cfg) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.port === 465,
      auth: { user: cfg.user, pass: cfg.pass },
    });
  }
  return transporter;
}

const FROM_ADDRESS =
  process.env.SMTP_FROM || "BuildCraft <no-reply@buildcraft.local>";

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

/**
 * Send an email. If SMTP env vars are not configured, the email payload
 * is logged to the console so devs can see what would have been sent.
 */
export async function sendEmail({ to, subject, html }: EmailPayload): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    // Dev fallback — log to console so we can still see outgoing mail content.
    console.log("\n========== EMAIL (dev fallback) ==========");
    console.log(`To:      ${to}`);
    console.log(`From:    ${FROM_ADDRESS}`);
    console.log(`Subject: ${subject}`);
    console.log("------------------------------------------");
    console.log(html);
    console.log("==========================================\n");
    return true;
  }
  try {
    await transport.sendMail({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error("[email] Failed to send email:", err);
    return false;
  }
}

type OfferLike = {
  code: string;
  description?: string | null;
  discountType?: string;
  discountValue?: number;
  expiresAt?: Date | null;
};

/**
 * Notify all newsletter subscribers + all registered customers about a new
 * offer. Each recipient gets their own email; failures are logged but don't
 * abort the batch.
 */
export async function sendOfferNotificationToSubscribers(offer: OfferLike): Promise<number> {
  // Collect unique email addresses from subscribers + customers.
  const [subscribers, customers] = await Promise.all([
    db.subscriber.findMany({ select: { email: true, name: true } }),
    db.customer.findMany({ select: { email: true, name: true } }),
  ]);

  const recipients = new Map<string, string | null>();
  for (const s of subscribers) recipients.set(s.email, s.name);
  for (const c of customers) if (!recipients.has(c.email)) recipients.set(c.email, c.name);

  const discountLabel =
    offer.discountType === "fixed"
      ? `₹${offer.discountValue ?? 0} off`
      : `${offer.discountValue ?? 0}% off`;

  const expiry = offer.expiresAt
    ? new Date(offer.expiresAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "no expiry";

  let sent = 0;
  for (const [email, name] of recipients) {
    const greeting = name ? `Hi ${name},` : "Hi there,";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1f2937;">
        <h1 style="font-size: 22px; color: #c2410c; margin: 0 0 16px;">New Offer from BuildCraft 🏗️</h1>
        <p style="font-size: 15px; line-height: 1.6;">${greeting}</p>
        <p style="font-size: 15px; line-height: 1.6;">
          We've just launched a new promo code <strong style="color: #c2410c;">${offer.code}</strong>
          — ${discountLabel} on subscription plans for providers.
        </p>
        ${offer.description ? `<p style="font-size: 15px; line-height: 1.6;">${offer.description}</p>` : ""}
        <p style="font-size: 14px; color: #6b7280;">Valid until: ${expiry}</p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="font-size: 13px; color: #9ca3af;">
          You received this email because you subscribed to BuildCraft updates.
          Reply STOP to unsubscribe.
        </p>
      </div>
    `;
    const ok = await sendEmail({ to: email, subject: `New Offer: ${offer.code} — ${discountLabel}`, html });
    if (ok) sent++;
  }
  return sent;
}
