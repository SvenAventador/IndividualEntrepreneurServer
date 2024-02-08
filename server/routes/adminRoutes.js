const Router = require('express')
const routes = new Router()

const adminController = require('../controllers/adminController')

routes.get('/getAllSuppliers', adminController.getAllSuppliers)
routes.post('/createOrder', adminController.createOrder)
routes.post('/addSupplier', adminController.createSupplier)
routes.delete('/deleteOneSupplier', adminController.deleteOneSupplier)
routes.delete('/deleteAllSupplier', adminController.deleteAllSuppliers)

module.exports = routes