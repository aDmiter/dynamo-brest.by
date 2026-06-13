import { NextResponse } from 'next/server';
import { requireAdminSection } from '@/lib/admin-api-auth';
import { createMailTransporter, getMailFrom } from '@/lib/mail-config';

export async function GET() {
  const auth = await requireAdminSection('settings');
  if (auth instanceof NextResponse) return auth;

  try {
    const to = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    if (!to) {
      return NextResponse.json(
        { success: false, error: 'Задайте ADMIN_EMAIL или SMTP_USER в .env' },
        { status: 500 }
      );
    }

    const transporter = createMailTransporter();
    await transporter.verify();

    await transporter.sendMail({
      from: getMailFrom(),
      to,
      subject: 'Тест SMTP — Динамо-Брест',
      text: 'Если вы читаете это — почта настроена.',
    });

    return NextResponse.json({ success: true, message: `Письмо отправлено на ${to}` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
