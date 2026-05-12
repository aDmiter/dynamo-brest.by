import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Динамо-Брест <onboarding@resend.dev>',
      to: 'admiter@gmail.com',
      subject: '🎽 Тест письма — Динамо-Брест',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="margin: 0; padding: 0; background-color: #0d1117; font-family: 'Inter', Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #151b26;">
            <div style="background: linear-gradient(135deg, #242C41 0%, #1a1f2e 100%); padding: 40px 0; text-align: center; border-bottom: 3px solid #ee862c;">
              <img src="https://dynamo-brest.by/images/logos/logo-white.png" alt="Динамо-Брест" style="height: 60px; margin-bottom: 20px;">
              <h1 style="color: #ffffff; font-family: 'Inter Tight', Arial, sans-serif; font-weight: 900; font-size: 28px; margin: 0;">ТЕСТОВОЕ ПИСЬМО</h1>
            </div>
            
            <div style="padding: 30px 25px; text-align: center;">
              <div style="display: inline-block; background: #ee862c20; border: 1px solid #ee862c; padding: 15px 30px; margin-bottom: 25px;">
                <span style="color: #ee862c; font-weight: bold; font-size: 18px;">✅ Resend работает!</span>
              </div>
              
              <p style="color: #ffffff; font-size: 16px; margin-bottom: 20px;">
                Поздравляю! <strong style="color: #ee862c;">Письма с вашего домена</strong> будут уходить.
              </p>
              
              <p style="color: #a5b3d5; line-height: 1.6;">
                Теперь система отправки писем настроена. При создании заказа клиент получит подтверждение, а администратор — уведомление.
              </p>
              
              <div style="background: #0d1117; padding: 20px; margin-top: 30px; border-left: 3px solid #ee862c; text-align: left;">
                <p style="color: #ee862c; margin: 0 0 10px; font-weight: bold;">📬 Что настроено:</p>
                <p style="color: #a5b3d5; margin: 5px 0;">✓ Подтверждение заказа клиенту</p>
                <p style="color: #a5b3d5; margin: 5px 0;">✓ Уведомление администратору</p>
                <p style="color: #a5b3d5; margin: 5px 0;">✓ Уведомления о смене статуса</p>
                <p style="color: #a5b3d5; margin: 5px 0;">✓ Красивый дизайн в стиле клуба</p>
              </div>
            </div>
            ${getFooterHtml()}
          </div>
        </body>
        </html>
      `,
      text: 'Resend работает! Письма с вашего домена будут уходить. Теперь при создании заказа клиент получит подтверждение, а администратор — уведомление.',
    });

    if (error) {
      console.error('Resend API ошибка:', error);
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    console.log('Тестовое письмо отправлено, ID:', data?.id);
    return NextResponse.json({
      success: true,
      id: data?.id,
      message: 'Письмо отправлено! Проверьте почту admiter@gmail.com',
    });
  } catch (error) {
    console.error('Ошибка при отправке:', error);
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}

function getFooterHtml(): string {
  return `
    <div style="background: #1a1f2e; padding: 30px 20px; text-align: center; border-top: 1px solid #2a3045;">
      <p style="color: #a5b3d5; font-size: 12px; margin: 0 0 10px;">
        © ${new Date().getFullYear()} ФК «Динамо-Брест». Все права защищены.
      </p>
      <p style="color: #6b7280; font-size: 11px; margin: 0;">
        Этот email был отправлен автоматически. Пожалуйста, не отвечайте на него.
      </p>
    </div>
  `;
}
