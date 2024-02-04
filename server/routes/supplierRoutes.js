const Router = require('express')
const routes = new Router()

const supplierController = require('../controllers/supplierController')

routes.get('/getAllGoods', supplierController.getAllGoods)
routes.get('/getOneGood', supplierController.getOneGood)
routes.post('/addGood', supplierController.addGood)
routes.put('/updateGood', supplierController.updateGood)
routes.delete('/deleteOneGood', supplierController.deleteOneGood)
routes.delete('/deleteAllGoods', supplierController.deleteAllGoods)

module.exports = routes