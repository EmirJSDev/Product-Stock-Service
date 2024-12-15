const express = require('express');
const pool = require('../db');
const router = express.Router();
const Joi = require('joi'); // Подключаем Joi для валидации

// Схема валидации для создания/обновления остатков
const stockSchema = Joi.object({
    product_id: Joi.number().integer().positive().required(),
    shelf_quantity: Joi.number().integer().min(0).required(),
    order_quantity: Joi.number().integer().min(0).required(),
    shop_id: Joi.number().integer().positive().required(),
});

// Схема валидации для увеличения/уменьшения остатков
const stockChangeSchema = Joi.object({
    shelf_quantity: Joi.number().integer().min(0).optional(),
    order_quantity: Joi.number().integer().min(0).optional(),
});

// 1. Создание записи об остатках
router.post('/', async (req, res) => {
    try {
        // Валидация данных с помощью Joi
        const { error } = stockSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { product_id, shelf_quantity, order_quantity, shop_id } = req.body;
        const result = await pool.query(
            `INSERT INTO stocks (product_id, shelf_quantity, order_quantity, shop_id)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [product_id, shelf_quantity, order_quantity, shop_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Ошибка при создании записи об остатках:', err.stack); // Логирование стека вызовов
        if (err.code === '23503') { // Проверка на ошибку внешнего ключа
            return res.status(400).json({ error: 'Несуществующий product_id или shop_id' });
        }
        res.status(500).json({ error: 'Ошибка при создании записи об остатках' });
    }
});

// 2. Получение всех записей об остатках
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM stocks`);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Ошибка при получении записей об остатках:', err.stack);
        res.status(500).json({ error: 'Ошибка при получении записей об остатках' });
    }
});

// 3. Получение остатков по ID товара
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Валидация id
        const idSchema = Joi.number().integer().positive().required();
        const { error } = idSchema.validate(id);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const result = await pool.query(`SELECT * FROM stocks WHERE product_id = $1`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Остаток не найден' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Ошибка при получении остатков по ID:', err.stack);
        res.status(500).json({ error: 'Ошибка при получении остатков по ID' });
    }
});

// 4. Обновление записи об остатках
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Валидация id
        const idSchema = Joi.number().integer().positive().required();
        const { error: idError } = idSchema.validate(id);
        if (idError) {
            return res.status(400).json({ error: idError.details[0].message });
        }

        // Валидация данных с помощью Joi
        const { error: bodyError } = stockSchema.validate(req.body);
        if (bodyError) {
            return res.status(400).json({ error: bodyError.details[0].message });
        }

        const { shelf_quantity, order_quantity, shop_id } = req.body;
        const result = await pool.query(
            `UPDATE stocks
             SET shelf_quantity = $1, order_quantity = $2, shop_id = $3
             WHERE id = $4 RETURNING *`,
            [shelf_quantity, order_quantity, shop_id, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Остаток не найден' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Ошибка при обновлении записи об остатках:', err.stack);
        if (err.code === '23503') {
            return res.status(400).json({ error: 'Несуществующий shop_id' });
        }
        res.status(500).json({ error: 'Ошибка при обновлении записи об остатках' });
    }
});

// 5. Удаление записи об остатках
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Валидация id
        const idSchema = Joi.number().integer().positive().required();
        const { error } = idSchema.validate(id);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const result = await pool.query(`DELETE FROM stocks WHERE id = $1 RETURNING *`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Остаток не найден' });
        }
        res.status(200).json({ message: 'Остаток удалён', deleted: result.rows[0] });
    } catch (err) {
        console.error('Ошибка при удалении записи об остатках:', err.stack);
        res.status(500).json({ error: 'Ошибка при удалении записи об остатках' });
    }
});

// 6. Увеличение количества остатков
router.put('/increase/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Валидация id
        const idSchema = Joi.number().integer().positive().required();
        const { error: idError } = idSchema.validate(id);
        if (idError) {
            return res.status(400).json({ error: idError.details[0].message });
        }

        // Валидация данных с помощью Joi
        const { error: bodyError } = stockChangeSchema.validate(req.body);
        if (bodyError) {
            return res.status(400).json({ error: bodyError.details[0].message });
        }

        const { shelf_quantity, order_quantity } = req.body;
        const result = await pool.query(
            `UPDATE stocks
             SET
                 shelf_quantity = shelf_quantity + COALESCE($1, 0),
                 order_quantity = order_quantity + COALESCE($2, 0)
             WHERE id = $3
                 RETURNING *`,
            [shelf_quantity, order_quantity, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Остаток не найден' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Ошибка при увеличении количества остатков:', err.stack);
        res.status(500).json({ error: 'Ошибка при увеличении количества остатков' });
    }
});

// 7. Уменьшение количества остатков
router.put('/decrease/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Валидация id
        const idSchema = Joi.number().integer().positive().required();
        const { error: idError } = idSchema.validate(id);
        if (idError) {
            return res.status(400).json({ error: idError.details[0].message });
        }

        // Валидация данных с помощью Joi
        const { error: bodyError } = stockChangeSchema.validate(req.body);
        if (bodyError) {
            return res.status(400).json({ error: bodyError.details[0].message });
        }

        const { shelf_quantity, order_quantity } = req.body;
        const result = await pool.query(
            `UPDATE stocks
             SET
                 shelf_quantity = GREATEST(shelf_quantity - COALESCE($1, 0), 0),
                 order_quantity = GREATEST(order_quantity - COALESCE($2, 0), 0)
             WHERE id = $3
                 RETURNING *`,
            [shelf_quantity, order_quantity, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Остаток не найден' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Ошибка при уменьшении количества остатков:', err.stack);
        res.status(500).json({ error: 'Ошибка при уменьшении количества остатков' });
    }
});

// 8. Фильтрация остатков
router.get('/filter', async (req, res) => {
    const { plu, shop_id, shelf_min, shelf_max, order_min, order_max } = req.query;

    try {
        // Валидация параметров запроса
        const filterSchema = Joi.object({
            plu: Joi.string().optional(),
            shop_id: Joi.number().integer().positive().optional(),
            shelf_min: Joi.number().integer().min(0).optional(),
            shelf_max: Joi.number().integer().min(0).optional(),
            order_min: Joi.number().integer().min(0).optional(),
            order_max: Joi.number().integer().min(0).optional(),
        });
        const { error } = filterSchema.validate(req.query);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const result = await pool.query(
            `SELECT stocks.*, products.plu, products.name
             FROM stocks
                      JOIN products ON stocks.product_id = products.id
             WHERE ($1 IS NULL OR products.plu = $1)
               AND ($2 IS NULL OR stocks.shop_id = $2)
               AND ($3 IS NULL OR stocks.shelf_quantity >= $3)
               AND ($4 IS NULL OR stocks.shelf_quantity <= $4)
               AND ($5 IS NULL OR stocks.order_quantity >= $5)
               AND ($6 IS NULL OR stocks.order_quantity <= $6)`,
            [plu, shop_id, shelf_min, shelf_max, order_min, order_max]
        );
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Ошибка при фильтрации остатков:', err.stack);
        res.status(500).json({ error: 'Ошибка при фильтрации остатков' });
    }
});

module.exports = router;