const Router = require('express')
const routes = new Router()

const supplierController = require('../controllers/supplierController')

routes.get('/getAllGoods', supplierController.getAllGoods)
routes.get('/getOneGood', supplierController.getOneGood)
routes.get('/allInvoice', supplierController.getAllInvoice)
routes.post('/addGood', supplierController.addGood)
routes.post('/changeStatus', supplierController.changeDeliveryStatus)
routes.post('/adoptInvoice', supplierController.adoptInvoice)
routes.put('/updateGood', supplierController.updateGood)
routes.delete('/deleteOneGood', supplierController.deleteOneGood)
routes.delete('/deleteAllGoods', supplierController.deleteAllGoods)

module.exports = routes