import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET() {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'divid.joomlin@gmail.com',
        pass: 'tbckytarhjtnjjkg',
      },
    });

    await transporter.sendMail({
      from: 'divid.joomlin@gmail.com',
      to: 'divid.joomlin@gmail.com', // себе для теста
      subject: 'Тест Gmail SMTP',
      text: 'Если вы читаете это — Gmail работает!',
    });

    return NextResponse.json({ success: true, message: 'Письмо отправлено!' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
