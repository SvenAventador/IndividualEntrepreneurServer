const Router = require('express')
const routes = new Router()

const adminController = require('../controllers/adminController')

routes.post('/addSupplier', adminController.createSupplier)

module.exports = routes