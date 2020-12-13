const express = require('express')
const router = express.Router()
// 引入 multer 並設定上傳資料夾 
const multer = require('multer')
const { authenticate } = require('passport')
const upload = multer({ dest: 'temp/' })

const adminController = require('../controllers/api/adminControllers')
const categoryController = require('../controllers/api/categoryController')
const adminService = require('../services/adminServices')
const categoryService = require('../services/categoryService')

router.get('/admin/restaurants', adminController.getRestaurants)
router.get('/admin/restaurants/:id', adminController.getRestaurant)
router.get('/admin/categories', categoryController.getCategories)
router.post('/admin/categories', categoryController.postCategory)
router.put('/admin/restaurants/:id', upload.single('image'), adminService.putRestaurant)
router.delete('/admin/restaurants/:id', adminController.deleteRestaurant)
router.post('/admin/restaurants', upload.single('image'), adminController.postRestaurant)


module.exports = router