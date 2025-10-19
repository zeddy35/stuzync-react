import nodemailer from "nodemailer";

const {
  SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM
} = process.env;

export const transporter = nodemailer.createTransport({
  host: SMTP_HOST || "smtp.gmail.com",
  port: Number(SMTP_PORT || 465),
  secure: (SMTP_SECURE ?? "true") === "true",
  auth: { user: SMTP_USER, pass: SMTP_PASS },
  pool: true, maxConnections: 3, maxMessages: 50, rateDelta: 1000, rateLimit: 5,
});

export async function sendVerificationEmail(toEmail: string, verifyLink: string) {
  await transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to: toEmail,
    subject: "Verify your StuZync account",
    text: `Confirm your StuZync account: ${verifyLink}`,
    html: `<p>Confirm your email:</p><p><a href="${verifyLink}">Verify</a></p><p>${verifyLink}</p>`,
  });
}
