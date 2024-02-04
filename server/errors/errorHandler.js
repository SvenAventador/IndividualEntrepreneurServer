class ErrorHandler extends Error {
    constructor(status, message) {
        super();

        this.status =  status
        this.message = message
    }

    static badRequest(message) {
        return new ErrorHandler(400, message)
    }

    static unauthorized(message) {
        return new ErrorHandler(401, message)
    }

    static forbidden(message) {
        return new ErrorHandler(403, message)
    }

    static notFound(message) {
        return new ErrorHandler(404, message)
    }

    static conflict(message) {
        return new ErrorHandler(409, message)
    }

    static internal(message) {
        return new ErrorHandler(500, message)
    }
}

module.exports = ErrorHandler