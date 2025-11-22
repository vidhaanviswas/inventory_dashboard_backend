const express = require('express');
const Inventory = require('../models/Inventory');
const Sku = require('../models/sku');

const router = express.Router();

/**
 * GET /api/alerts
 * Query: type=low-stock (default), threshold (number), limit (number)
 * Returns list of alerts for inventory/sku issues. Currently supports "low-stock".
 */
router.get('/', async (req, res) => {
    try {
        const { type = 'low-stock', threshold = 10, limit = 10 } = req.query;

        if (type === 'low-stock') {
            const threshNum = Number(threshold) || 10;
            const lim = Math.min(100, Math.max(1, Number(limit) || 10));

            // aggregate inventory by SKU to get total available
            const agg = await Inventory.aggregate([
                { $group: { _id: '$sku', totalAvailable: { $sum: { $ifNull: ['$available', 0] } } } },
                { $match: { totalAvailable: { $lte: threshNum } } },
                { $sort: { totalAvailable: 1 } },
                { $limit: lim },
            ]);

            // fetch SKU names for the results
            const skus = await Sku.find({ sku: { $in: agg.map((a) => a._id) } }).select('sku name').lean();
            const skuMap = skus.reduce((m, s) => ((m[s.sku] = s), m), {});

            const result = agg.map((a) => ({ sku: a._id, name: (skuMap[a._id] && skuMap[a._id].name) || null, totalAvailable: a.totalAvailable }));

            return res.json(result);
        }

        return res.status(400).json({ message: 'Unsupported alert type' });
    } catch (err) {
        console.error('Error computing alerts:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
