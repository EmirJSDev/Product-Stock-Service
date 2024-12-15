const { Pool } = require('pg');
require('dotenv').config();

// Настройка пула соединений с дополнительными параметрами
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,

    // Дополнительные параметры для оптимизации пула
    max: 20, // Максимальное количество клиентов в пуле
    idleTimeoutMillis: 30000, // Время ожидания неактивного клиента перед закрытием (в миллисекундах)
    connectionTimeoutMillis: 2000, // Время ожидания подключения к базе данных (в миллисекундах)
});

// Функция для проверки подключения к базе данных
const testDatabaseConnection = async () => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()'); // Простой запрос для проверки
        console.log('Успешное подключение к базе данных!', result.rows[0].now);
        client.release();
    } catch (err) {
        console.error('Ошибка подключения к базе данных:', err.stack); // Логирование стека вызовов при ошибке
    }
};

// Вызов функции проверки подключения
testDatabaseConnection();

module.exports = pool;