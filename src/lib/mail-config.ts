import nodemailer from 'nodemailer';

function env(name: string, fallback = ''): string {
  return process.env[name]?.trim() || fallback;
}

export function getMailFrom(): string {
  const explicit = env('MAIL_FROM');
  if (explicit) return explicit;

  const name = env('MAIL_FROM_NAME', 'ФК «Динамо-Брест»');
  const address = env('MAIL_FROM_ADDRESS', env('SMTP_USER'));
  return `${name} <${address}>`;
}

export function createMailTransporter() {
  const host = env('SMTP_HOST', 'smtp.gmail.com');
  const port = Number(env('SMTP_PORT', '587'));
  const user = env('SMTP_USER');
  const pass = env('SMTP_PASS');

  if (!user || !pass) {
    throw new Error('SMTP_USER и SMTP_PASS должны быть заданы в .env');
  }

  const secure = env('SMTP_SECURE') === '1' || port === 465;
  const rejectUnauthorized = env('SMTP_TLS_REJECT_UNAUTHORIZED', '1') !== '0';

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized },
    ...(secure ? {} : { requireTLS: env('SMTP_REQUIRE_TLS', '1') === '1' }),
  });
}