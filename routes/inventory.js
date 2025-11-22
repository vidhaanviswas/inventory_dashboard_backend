// server/routes/inventory.js
const express = require('express');
const Inventory = require('../models/Inventory');

const router = express.Router();

/**
 * GET /api/inventory
 * Optional query params:
 *  - sku: filter by SKU code
 *  - location: filter by location (partial match)
 */
router.get('/', async (req, res) => {
    try {
        const { sku, location } = req.query;
        const filter = {};

        if (sku) {
            filter.sku = { $regex: sku, $options: 'i' };
        }

        if (location) {
            filter.location = { $regex: location, $options: 'i' };
        }

        const rows = await Inventory.find(filter).sort({ sku: 1, location: 1 });
        res.json(rows);
    } catch (err) {
        console.error('Error fetching inventory:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * POST /api/inventory
 * Body: { sku, location, available, reserved }
 * Use this from Postman to seed inventory data.
 */
router.post('/', async (req, res) => {
    try {
        const { sku, location, available, reserved } = req.body;

        if (!sku || !location) {
            return res
                .status(400)
                .json({ message: 'sku and location are required' });
        }

        const row = await Inventory.create({
            sku,
            location,
            available: available ?? 0,
            reserved: reserved ?? 0,
        });

        res.status(201).json(row);
    } catch (err) {
        console.error('Error creating inventory row:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * PUT /api/inventory/:id
 * Update an inventory row by id
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { sku, location, available, reserved } = req.body;

        const update = {};
        if (sku !== undefined) update.sku = sku;
        if (location !== undefined) update.location = location;
        if (available !== undefined) update.available = available;
        if (reserved !== undefined) update.reserved = reserved;

        const updated = await Inventory.findByIdAndUpdate(id, update, { new: true });
        if (!updated) return res.status(404).json({ message: 'Not found' });
        res.json(updated);
    } catch (err) {
        console.error('Error updating inventory row:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * DELETE /api/inventory/:id
 * Remove an inventory row
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const removed = await Inventory.findByIdAndDelete(id);
        if (!removed) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        console.error('Error deleting inventory row:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
