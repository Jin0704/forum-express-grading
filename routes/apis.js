const express = require('express')
const router = express.Router()

const adminController = require('../controllers/api/adminControllers')

router.get('/admin/restaurants', adminController.getRestaurants)

module.exports = router