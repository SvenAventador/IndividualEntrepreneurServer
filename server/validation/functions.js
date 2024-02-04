const jwt = require('jsonwebtoken')

class Validation {
    static isString(value) {
        return typeof value === "string"
    }

    static isEmpty(value) {
        return value.trim() === ''
    }

    static isObject(value) {
        return typeof value === "object"
    }

    static isEmptyObject(value) {
        return !Object.keys(value).length
    }

    static isNumber(value) {
        return typeof value === "number"
    }

    static isEmail(value) {
        const regex = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu
        return regex.test(value)
    }

    static isPassword(value) {
        return value.length >= 8
    }

    static generate_jwt(
        userId,
        userEmail,
        userRole,
        userSurname = null,
        userName = null,
        userPatronymic = null,
        userAddress = null,
        userPhone = null
    ) {
        const payload = {
            userId,
            userEmail,
            userRole,
            userSurname,
            userName,
            userPatronymic,
            userAddress,
            userPhone
        }

        return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
            expiresIn: '24h'
        })
    }
}

module.exports = Validation