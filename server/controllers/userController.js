const {
    User,
    Cart, Supplier
} = require("../database/model");
const Validation = require("../validation/functions");
const ErrorHandler = require("../errors/errorHandler")
const bcrypt = require('bcrypt')

class UserController {
    async registration(req, res, next) {
        try {
            const {
                userEmail,
                userPassword,
                userRole = 'USER'
            } = req.body

            if (!(Validation.isString(userEmail)) || !(Validation.isEmail(userEmail)))
                return next(ErrorHandler.badRequest('Пожалуйста, введите корректную почту!'))

            if (!(Validation.isString(userPassword)) || !(Validation.isPassword(userPassword)))
                return next(ErrorHandler.badRequest('Пожалуйста, введите корректный пароль! Минимальная длина пароля должна быть 8 символов'))

            const candidate = await User.findOne({where: {userEmail}})
            if (candidate) {
                return next(ErrorHandler.conflict(`Пользователь с почтой ${userEmail} уже существует!`))
            }

            const user = await User.create({
                userEmail,
                userPassword: await bcrypt.hash(userPassword, 5),
                userRole
            })

            await Cart.create({
                userId: user.id
            })

            const token = Validation.generate_jwt(
                user.id,
                userEmail,
                userRole
            )
            return res.json({token})
        } catch (error) {
            return next(ErrorHandler.internal(`Непредвиденная ошибка: ${error}`))
        }
    }

    async login(req, res, next) {
        try {
            const {
                userEmail,
                userPassword,
            } = req.body

            if (!(Validation.isString(userEmail)) || !(Validation.isEmail(userEmail)))
                return next(ErrorHandler.badRequest('Пожалуйста, введите корректную почту!'))

            if (!(Validation.isString(userPassword)) || !(Validation.isPassword(userPassword)))
                return next(ErrorHandler.badRequest('Пожалуйста, введите корректный пароль! Минимальная длина пароля должна быть 8 символов'))

            const candidate = await User.findOne({where: {userEmail}})
            if (!candidate) {
                return next(ErrorHandler.conflict(`Пользователя с почтой ${userEmail} не существует!`))
            }

            if (!(bcrypt.compareSync(userPassword, candidate.userPassword))) {
                return next(ErrorHandler.conflict('Вы ввели неправильный пароль!'))
            }

            let token
            if (candidate.userRole === 'SUPPLIER') {
                const supplier = await Supplier.findOne({where: {userId: candidate.id}})
                token = Validation.generate_jwt(
                    supplier.id,
                    candidate.userEmail,
                    candidate.userRole,
                    supplier.supplierSurname,
                    supplier.supplierName,
                    supplier.supplierPatronymic
                )
            } else if (candidate.userRole === 'USER') {
                token = Validation.generate_jwt(
                    candidate.id,
                    candidate.userEmail,
                    candidate.userRole,
                    candidate.userSurname,
                    candidate.userName,
                    candidate.userPatronymic,
                    candidate.userAddress,
                    candidate.userPhone
                )
            } else {
                token = Validation.generate_jwt(
                    candidate.id,
                    candidate.userEmail,
                    candidate.userRole
                )
            }

            return res.json({token})
        } catch (error) {
            return next(ErrorHandler.internal(`Непредвиденная ошибка: ${error}`))
        }
    }

    async check(req, res, next) {
        const token = Validation.generate_jwt(
            req.user.userId,
            req.user.userEmail,
            req.user.userRole
        )

        return res.json({token})
    }

    async logout(req, res, next) {
        const token = req.headers.authorization
        if (!token)
            return next(ErrorHandler.unauthorized("Пользователь не авторизован!"))

        try {
            return res.json({message: "Вы успешно вышли из системы!"})
        } catch (error) {
            return next(ErrorHandler.internal(`Непредвиденная ошибка: ${error}`))
        }
    }
}

module.exports = new UserController()