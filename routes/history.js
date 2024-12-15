const express = require('express');

const pool = require('../db');

const router = express.Router();

const Joi = require('joi');



// Схема валидации для параметров запроса

const historyFilterSchema = Joi.object({

    shop_id: Joi.number().integer().positive().optional(),

    product_id: Joi.number().integer().positive().optional(),

    action: Joi.string().valid('add', 'remove', 'update').optional(), // Допустимые значения для action

    start_date: Joi.date().iso().optional(),

    end_date: Joi.date().iso().optional(),

    page: Joi.number().integer().min(1).optional(), // Номер страницы для пагинации

    pageSize: Joi.number().integer().min(1).optional(), // Количество записей на странице

});



// 2. Получение истории по фильтрам

router.get('/', async (req, res) => {

    try {

// Валидация параметров запроса с помощью Joi

        const { error } = historyFilterSchema.validate(req.query);

        if (error) {

            return res.status(400).json({ error: error.details[0].message });

        }



        let { shop_id, product_id, action, start_date, end_date, page, pageSize } = req.query;



// Преобразование start_date и end_date в формат даты для PostgreSQL (если они есть)

        const filterStartDate = start_date ? new Date(start_date).toISOString() : null;

        const filterEndDate = end_date ? new Date(end_date).toISOString() : null;



// Преобразование shop_id и product_id в числа (если они есть)

        shop_id = shop_id ? parseInt(shop_id, 10) : null;

        product_id = product_id ? parseInt(product_id, 10) : null;



// Значения по умолчанию для пагинации

        page = page ? parseInt(page, 10) : 1;

        pageSize = pageSize ? parseInt(pageSize, 10) : 10;



// Базовый SQL-запрос

        let query = `SELECT * FROM history WHERE 1=1`;

        const queryParams = [];



// Добавление условий фильтрации в зависимости от параметров

        if (shop_id) {

            query += ` AND shop_id = $${queryParams.length + 1}`;

            queryParams.push(shop_id);

        }

        if (product_id) {

            query += ` AND product_id = $${queryParams.length + 1}`;

            queryParams.push(product_id);

        }

        if (action) {

            query += ` AND action = $${queryParams.length + 1}`;

            queryParams.push(action);

        }

        if (filterStartDate) {

            query += ` AND created_at >= $${queryParams.length + 1}`;

            queryParams.push(filterStartDate);

        }

        if (filterEndDate) {

            query += ` AND created_at <= $${queryParams.length + 1}`;

            queryParams.push(filterEndDate);

        }



// Добавление пагинации

        query += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;

        queryParams.push(pageSize, (page - 1) * pageSize);



// Выполнение запроса

        const result = await pool.query(query, queryParams);

        res.status(200).json(result.rows);

    } catch (err) {

        console.error('Ошибка при получении истории:', err.stack);

        res.status(500).json({ error: 'Ошибка при получении истории' });

    }

});



module.exports = router;