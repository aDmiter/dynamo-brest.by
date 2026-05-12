// test-smtp.js
const nodemailer = require('nodemailer');

async function testSMTP() {
  console.log('🔍 Тестируем SMTP подключение...');

  const transporter = nodemailer.createTransport({
    host: 'smtp.yandex.ru',
    port: 465,
    secure: true,
    auth: {
      user: 'shopdynamo1960@yandex.by',
      pass: 'Password28!@', // ВРЕМЕННО! Потом замените на пароль приложения
    },
  });

  try {
    // Проверяем подключение
    await transporter.verify();
    console.log('✅ SMTP подключение успешно!');

    // Отправляем тестовое письмо (замените email на свой реальный)
    const info = await transporter.sendMail({
      from: 'shopdynamo1960@yandex.by',
      to: 'ваш_личный_email@example.com', // ✏️ ЗАМЕНИТЕ НА СВОЙ EMAIL
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
