const express = require('express');
const router = express.Router();
const pool = require('../db');
const Joi = require('joi');

// Схема валидации для создания товара
const productSchema = Joi.object({
    plu: Joi.string().required(),
    name: Joi.string().required(),
});

// Создание товара
router.post('/', async (req, res) => {
    try {
        // Валидация данных с помощью Joi
        const { error } = productSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { plu, name } = req.body;
        const result = await pool.query(
            'INSERT INTO products (plu, name) VALUES ($1, $2) RETURNING *',
            [plu, name],
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Ошибка при создании товара:', err.stack); // Логирование стека вызовов
        if (err.code === '23505') { // Проверка на ошибку уникального ключа
            return res.status(400).json({ error: 'Товар с таким plu уже существует' });
        }
        res.status(500).json({ error: 'Ошибка при создании товара' });
    }
});

// Получение товаров по фильтрам
router.get('/', async (req, res) => {
    const { name, plu } = req.query;
    try {
        // Валидация параметров запроса
        const filterSchema = Joi.object({
            name: Joi.string().optional(),
            plu: Joi.string().optional(),
        });
        const { error } = filterSchema.validate(req.query);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const result = await pool.query(
            `SELECT * FROM products WHERE ($1::TEXT IS NULL OR name ILIKE '%' || $1 || '%') 
            AND ($2::TEXT IS NULL OR plu = $2)`,
            [name, plu],
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка при получении товаров:', err.stack);
        res.status(500).json({ error: 'Ошибка при получении товаров' });
    }
});

module.exports = router;