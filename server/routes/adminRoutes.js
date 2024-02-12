const Router = require('express')
const routes = new Router()

const adminController = require('../controllers/adminController')

routes.get('/getAllSuppliers', adminController.getAllSuppliers)
routes.get('/getGoodsInCart', adminController.getGoodsInCart)
routes.get('/getAllGoods', adminController.getAllGoods)
routes.post('/addToCart', adminController.addToCart)
routes.post('/addSupplier', adminController.createSupplier)
routes.post('/createOrder', adminController.createOrder)
routes.delete('/deleteOneSupplier', adminController.deleteOneSupplier)
routes.delete('/deleteAllSupplier', adminController.deleteAllSuppliers)

module.exports = routes