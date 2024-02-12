const Router = require('express')
const routes = new Router()

const managerController = require('../controllers/managerController')

routes.get('/getAllAdoptInvoices', managerController.getAdoptInvoice)
routes.post('/closeOrder', managerController.closeOrder)

module.exports = routes