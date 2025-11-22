const express = require('express');
const Sku = require('../models/sku');
const Warehouse = require('../models/Warehouse');
const Inventory = require('../models/Inventory');

const router = express.Router();

/**
 * GET /api/stats
 * Returns lightweight aggregated counts and totals used by the dashboard/overview.
 */
router.get('/', async (req, res) => {
    try {
        // Use efficient MongoDB aggregations where possible
        const [skuCount, activeSkuCount, whCount, invAgg] = await Promise.all([
            Sku.countDocuments(),
            Sku.countDocuments({ status: 'Active' }),
            Warehouse.countDocuments(),
            Inventory.aggregate([
                { $group: { _id: null, totalAvailable: { $sum: { $ifNull: ['$available', 0] } }, rows: { $sum: 1 } } },
            ]),
        ]);

        // warehouse breakdown by type
        const whTypes = await Warehouse.aggregate([
            { $match: {} },
            { $group: { _id: { $toLower: '$type' }, count: { $sum: 1 } } },
        ]);

        const typeMap = (whTypes || []).reduce((acc, t) => {
            acc[t._id] = t.count;
            return acc;
        }, {});

        const totalAvailable = (invAgg && invAgg[0] && invAgg[0].totalAvailable) || 0;
        const inventoryRows = (invAgg && invAgg[0] && invAgg[0].rows) || 0;

        res.json({
            skus: skuCount,
            activeSkus: activeSkuCount,
            warehouses: whCount,
            ownWarehouses: typeMap['own'] || 0,
            ecommerceWarehouses: (typeMap['marketplace'] || 0) + (typeMap['store'] || 0),
            thirdPartyWarehouses: typeMap['3pl'] || 0,
            inventoryRows,
            totalAvailable,
        });
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
