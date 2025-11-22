const express = require('express');
const Warehouse = require('../models/Warehouse');

const router = express.Router();

// GET /api/warehouses
router.get('/', async (req, res) => {
    try {
        const warehouses = await Warehouse.find().sort({ name: 1 });
        res.json(warehouses);
    } catch (err) {
        console.error('Error fetching warehouses:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/warehouses
router.post('/', async (req, res) => {
    try {
        const { name, code, type, city, isActive } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'name is required' });
        }

        // If client supplied a code, ensure uniqueness. If not supplied, auto-generate.
        const prefix = 'WH-';
        let newCode = code && String(code).trim() ? String(code).trim() : null;

        if (newCode) {
            const existing = await Warehouse.findOne({ code: newCode });
            if (existing) {
                return res.status(400).json({ message: 'Warehouse code already exists' });
            }
        } else {
            // Auto-generate code by finding existing codes with the prefix and choosing the next number
            const docs = await Warehouse.find({ code: { $regex: `^${prefix}\\d+$` } }).select('code');
            let max = 0;
            docs.forEach((d) => {
                const m = String(d.code).match(new RegExp(`^${prefix}(\\d+)$`));
                if (m) {
                    const n = parseInt(m[1], 10);
                    if (!isNaN(n)) max = Math.max(max, n);
                }
            });

            newCode = `${prefix}${String(max + 1).padStart(3, '0')}`;
        }

        const wh = await Warehouse.create({
            name,
            code: newCode,
            type: type || 'Own',
            city,
            isActive: isActive !== undefined ? isActive : true,
        });

        res.status(201).json(wh);
    } catch (err) {
        console.error('Error creating warehouse:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/warehouses/:id
router.put('/:id', async (req, res) => {
    try {
        const { name, code, type, city, isActive } = req.body;

        if (!name || !code) {
            return res
                .status(400)
                .json({ message: 'name and code are required' });
        }

        const updated = await Warehouse.findByIdAndUpdate(
            req.params.id,
            { name, code, type, city, isActive },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: 'Warehouse not found' });
        }

        res.json(updated);
    } catch (err) {
        console.error('Error updating warehouse:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/warehouses/:id
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Warehouse.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Warehouse not found' });
        }
        res.json({ message: 'Warehouse deleted' });
    } catch (err) {
        console.error('Error deleting warehouse:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;
