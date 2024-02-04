const Router = require('express')
const routes = new Router()
const authMiddleware = require('../middlewares/authMiddleware')
const UserController = require('../controllers/userController')

routes.post('/registration', UserController.registration)
routes.post('/login', UserController.login)
routes.get('/auth', authMiddleware, UserController.check)
routes.get('/logout', authMiddleware, UserController.logout)

module.exports = routes