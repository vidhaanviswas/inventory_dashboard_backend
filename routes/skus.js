const express = require('express');
const Sku = require('../models/sku');

const router = express.Router();

// GET /api/skus
router.get('/', async (req, res) => {
    try {
        const { q, category, status } = req.query;
        const filter = {};

        if (q) {
            filter.$or = [
                { sku: { $regex: q, $options: 'i' } },
                { name: { $regex: q, $options: 'i' } },
            ];
        }
        if (category && category !== 'All') filter.category = category;
        if (status && status !== 'All') filter.status = status;

        const skus = await Sku.find(filter).sort({ createdAt: -1 });
        res.json(skus);
    } catch (err) {
        console.error('Error fetching SKUs:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/skus (auto-generate SKU code)
router.post('/', async (req, res) => {
    try {
        const { name, category, status } = req.body;

        if (!name || !category) {
            return res
                .status(400)
                .json({ message: 'name and category are required' });
        }

        // Find last SKU based on creation time
        const lastSku = await Sku.find().sort({ createdAt: -1 }).limit(1);

        // Extract number and increment
        let nextNumber = 1;
        if (lastSku.length > 0) {
            const lastCode = lastSku[0].sku.replace('SKU-', '');
            nextNumber = Number(lastCode) + 1;
        }

        // Format SKU-001
        const newSkuCode = `SKU-${String(nextNumber).padStart(3, '0')}`;

        // Create SKU
        const newSku = await Sku.create({
            sku: newSkuCode,
            name,
            category,
            status: status || 'Active',
        });

        res.status(201).json(newSku);
    } catch (err) {
        console.error('Error creating SKU:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


// ✅ PUT /api/skus/:id
router.put('/:id', async (req, res) => {
    try {
        const { name, category, status } = req.body;

        if (!name || !category || !status) {
            return res
                .status(400)
                .json({ message: 'name, category, and status are required' });
        }

        const updated = await Sku.findByIdAndUpdate(
            req.params.id,
            { name, category, status },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: 'SKU not found' });
        }

        res.json(updated);
    } catch (err) {
        console.error('Error updating SKU:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/skus/:id
router.delete('/:id', async (req, res) => {
    try {
        const removed = await Sku.findByIdAndDelete(req.params.id);
        if (!removed) return res.status(404).json({ message: 'SKU not found' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        console.error('Error deleting SKU:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
