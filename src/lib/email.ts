import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST || "";
const port = Number(process.env.SMTP_PORT || 465);
const secure = String(process.env.SMTP_SECURE || "true").toLowerCase() === "true";
const user = process.env.SMTP_USER || "";
const pass = process.env.SMTP_PASS || "";
const from = process.env.MAIL_FROM || "StuZync <no-reply@stuzync.local>";

export async function sendVerificationEmail(to: string, link: string) {
  if (!host || !user || !pass) {
    console.log(`[mail] SMTP missing; simulate verify email to ${to}: ${link}`);
    return;
  }
  const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  await transporter.sendMail({ from, to, subject: "Verify your email", html: `<p><a href="${link}">Verify account</a></p>` });
}

