const express = require('express');
const { getAllLaptops, postLaptop, updateLaptop, getLaptop, deleteLaptop, getLaptopStats, getFilteredData } = require('../controllers/laptopController');
const { protect, restrictTo } = require('../controllers/authController');
const reviewRoutes = require('./reviewRoutes')
const router = express.Router();
router.use('/:productId/reviews' , reviewRoutes);
router.route('/').get(getAllLaptops).post(protect,restrictTo('admin'),postLaptop);
router.route('/:id').get(protect,getLaptop).patch(protect,restrictTo('admin'),updateLaptop).delete(protect,restrictTo('admin'),deleteLaptop);
// router.get('/laptop-stats', getLaptopStats);

module.exports = router;
