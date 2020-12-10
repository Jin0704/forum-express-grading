const express = require('express')
const router = express.Router()

const adminController = require('../controllers/api/adminControllers')
const categoryController = require('../controllers/api/categoryController')

router.get('/admin/restaurants', adminController.getRestaurants)
router.get('/admin/restaurants/:id', adminController.getRestaurant)
router.get('/admin/categories', categoryController.getCategories)
router.delete('/admin/restaurants/:id', adminController.deleteRestaurant)

module.exports = router