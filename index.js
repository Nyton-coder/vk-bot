require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// Константы из настроек сервера
const GROUP_ID = 230518773;
const CONFIRMATION_TOKEN = '1fe2613f';
const SECRET_KEY = 'aaQ13axAPQEcczQa';
const VK_TOKEN = process.env.VK_TOKEN;

// Функция для отправки сообщений
async function sendMessage(userId, message) {
    try {
        await axios.post('https://api.vk.com/method/messages.send', null, {
            params: {
                access_token: VK_TOKEN,
                v: '5.199',
                user_id: userId,
                message: message,
                random_id: Math.floor(Math.random() * 1000000)
            }
        });
    } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
    }
}

// Корневой маршрут
app.get('/', (req, res) => {
    console.log('GET запрос на корневой маршрут');
    res.send('VK Bot is running!');
});

// Обработка всех GET запросов
app.get('*', (req, res) => {
    console.log('GET запрос на:', req.path);
    res.send('VK Bot is running!');
});

// Обработка подтверждения сервера
app.post('/callback/xE4sA', async (req, res) => {
    console.log('Получен POST запрос на /callback/xE4sA');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);

    const { type, group_id } = req.body;

    // Проверка секретного ключа
    if (req.headers['x-vk-secret'] !== SECRET_KEY) {
        console.log('Неверный секретный ключ');
        console.log('Получен:', req.headers['x-vk-secret']);
        console.log('Ожидался:', SECRET_KEY);
        return res.status(403).send('Access denied');
    }

    // Обработка подтверждения сервера
    if (type === 'confirmation' && group_id === GROUP_ID) {
        console.log('Отправляем токен подтверждения:', CONFIRMATION_TOKEN);
        return res.send(CONFIRMATION_TOKEN);
    }

    // Обработка новых сообщений
    if (type === 'message_new') {
        const message = req.body.object.message;
        const text = message.text ? message.text.toLowerCase() : '';
        const userId = message.from_id;

        console.log('Получено новое сообщение:', text);

        // Логика ответов на сообщения
        if (text === '/start') {
            await sendMessage(userId, 'Привет! Я бот для личной страницы. Чем могу помочь?');
        } else if (text === '/время') {
            const now = new Date();
            await sendMessage(userId, `Текущее время: ${now.toLocaleTimeString()}`);
        } else if (text.includes('привет')) {
            await sendMessage(userId, 'Привет! Рад тебя видеть!');
        } else if (text.includes('как дела')) {
            await sendMessage(userId, 'Всё отлично! Готов помогать!');
        } else if (text.includes('помощь')) {
            await sendMessage(userId, 'Я могу:\n- Отвечать на приветствия\n- Поддерживать простой диалог\n- Показывать текущее время (/время)\n- Помогать с базовыми командами');
        } else {
            await sendMessage(userId, 'Извини, я пока не знаю, как ответить на это сообщение. Попробуй написать "помощь" для списка команд.');
        }
    }

    console.log('Отправляем ответ "ok"');
    res.send('ok');
});

// Запуск сервера
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
}); 