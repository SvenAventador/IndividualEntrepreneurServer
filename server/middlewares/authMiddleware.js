const ErrorHandler = require('../errors/errorHandler')
const jwt = require('jsonwebtoken')

module.exports = function (req, res, next) {
    if (req.method === "OPTIONS") {
        next()
    }

    try {
        const token = req.headers.authorization.split(' ')[1]

        if (!token) {
            return ErrorHandler.unauthorized("Данный пользователь не авторизован!")
        }
        req.user = jwt.verify(token, process.env.JWT_SECRET_KEY)

        next()
    } catch (e) {
        return ErrorHandler.unauthorized("Данный пользователь не авторизован!")
    }
}