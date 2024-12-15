const express = require('express');
const productRoutes = require('./routes/products');
const stockRoutes = require('./routes/stocks');
const historyRoutes = require('./routes/history');
const pool = require('./db');

const app = express();
app.use(express.json());

// Логирование входящих запросов с информацией о IP-адресе клиента
app.use((req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`Запрос от ${ip}: ${req.method} ${req.url}`);
    next();
});

// Отладочные сообщения для маршрутов
console.log('Инициализация маршрутов...');
app.use('/products', productRoutes);
app.use('/stocks', stockRoutes);
app.use('/history', historyRoutes);

// Обработка неправильных маршрутов
app.use((req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`Неправильный маршрут от ${ip}: ${req.method} ${req.url}`);
    res.status(404).json({ error: 'Маршрут не найден' });
});

// Обработка ошибок с логированием стека вызовов
app.use((err, req, res, next) => {
    console.error('Ошибка на сервере:', err.stack);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// Асинхронная функция для подключения к базе данных
const connectToDatabase = async () => {
    try {
        await pool.connect();
        console.log('Успешное подключение к базе данных!');
    } catch (err) {
        console.error('Ошибка подключения к базе данных:', err);
        // Можно добавить обработку ошибки, например, повторное подключение
    }
};

// Вызов функции подключения
connectToDatabase();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Ожидание запросов...');
});