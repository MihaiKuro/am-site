import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendPasswordResetEmail = async ({ to, resetUrl }) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP credentials are not configured");
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "Resetare parolă",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Resetare parolă</h2>
        <p>Click pe butonul de mai jos pentru a seta o parolă nouă:</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 20px;background:#2B4EE6;color:white;text-decoration:none;border-radius:6px;">
            Resetează parola
          </a>
        </p>
        <p>Dacă nu ai cerut acest lucru, ignoră acest email.</p>
      </div>
    `,
  });
};
