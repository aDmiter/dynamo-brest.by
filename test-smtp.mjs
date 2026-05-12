// test-smtp.mjs
import nodemailer from 'nodemailer';

async function testSMTP() {
  console.log('🔍 Тестируем SMTP подключение...');

  const transporter = nodemailer.createTransport({
    host: 'smtp.yandex.ru',
    port: 465,
    secure: true,
    auth: {
      user: 'shopdynamo1960@yandex.by',
      pass: 'gjmzmwgzkzzkfihh', // ВРЕМЕННО! Потом замените на пароль приложения
    },
  });

  try {
    // Проверяем подключение
    await transporter.verify();
    console.log('✅ SMTP подключение успешно!');

    // Отправляем тестовое письмо (✏️ ЗАМЕНИТЕ EMAIL НА СВОЙ)
    const info = await transporter.sendMail({
      from: 'shopdynamo1960@yandex.by',
      to: 'admin@dynamo-brest.by', // ⚠️ ЗАМЕНИТЕ!
      subject: 'Тест SMTP от Динамо-Брест',
      text: 'Если вы читаете это — SMTP работает!',
      html: '<h1>✅ Успех!</h1><p>SMTP настроен правильно.</p>',
    });

    console.log('✅ Тестовое письмо отправлено!');
    console.log('📧 ID письма:', info.messageId);
  } catch (error) {
    console.error('❌ Ошибка SMTP:');
    console.error(error);
  }
}

testSMTP();
