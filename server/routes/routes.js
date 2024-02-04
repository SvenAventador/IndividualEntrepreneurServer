const Router = require('express')
const router = new Router()

const adminRoutes = require('./adminRoutes')
const clientRoutes = require('./clientRoutes')
const managerRoutes = require('./managerRoutes')
const supplierRoutes = require('./supplierRoutes')
const userRoutes = require('./userRoutes')

router.use('/admin', adminRoutes)
router.use('/client', clientRoutes)
router.use('/manager', managerRoutes)
router.use('/supplier', supplierRoutes)
router.use('/user', userRoutes)

module.exports = router