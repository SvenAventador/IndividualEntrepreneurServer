const ErrorHandler = require('../errors/errorHandler')

module.exports = function (error, req, res, next) {

    if (error instanceof ErrorHandler) {
        return res.status(error.status).json({message: error.message})
    }
    return ErrorHandler.internal("Произошла ошибка во время работы сервера.")

}