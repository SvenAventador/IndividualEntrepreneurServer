const Validation = require("../validation/functions");
const ErrorHandler = require("../errors/errorHandler")
const {
    User,
    Cart, Supplier
} = require("../database/model");
const bcrypt = require("bcrypt");
const generator = require('generate-password');
const uuid = require("uuid");
const {resolve} = require("path");
const nodemailer = require('nodemailer')

class AdminController {
    async createSupplier(req, res, next) {
        const {
            userEmail,
            userRole = "SUPPLIER",
            supplierSurname,
            supplierName,
            supplierPatronymic = null
        } = req.body
        const {supplierImage} = req.files || {}
        try {
            if (!(Validation.isString(userEmail)) || !(Validation.isEmail(userEmail)))
                return next(ErrorHandler.badRequest('Пожалуйста, введите корректную почту поставщика!'))
            if (!(Validation.isString(supplierSurname) || Validation.isEmpty(supplierSurname)))
                return next(ErrorHandler.badRequest('Пожалуйста, введите корректную фамилию поставщика!'))
            if (!(Validation.isString(supplierName) || Validation.isEmpty(supplierName)))
                return next(ErrorHandler.badRequest('Пожалуйста, введите корректное имя поставщика!'))

            if (supplierImage === undefined)
                return next(ErrorHandler.badRequest('Пожалуйста, выберите изображение!'))

            const candidate = await User.findOne({where: {userEmail}})
            if (candidate) {
                return next(ErrorHandler.conflict(`Пользователь с почтой ${userEmail} уже существует!`))
            }

            let password = generator.generate({
                length: 8,
                numbers: true,
                uppercase: true,
                lowercase: true
            })
            const user = await User.create({
                userEmail,
                userPassword: await bcrypt.hash(password, 5),
                userRole
            })

            await Cart.create({
                userId: user.id
            })

            let fileName = uuid.v4() + ".jpg"
            await supplierImage.mv(resolve(__dirname, '..', 'static', fileName))

            const transporter = nodemailer.createTransport({
                host: 'smtp.mail.ru',
                port: 465,
                secure: true,
                auth: {
                    user: 'sasha.shumilkin010101@mail.ru',
                    pass: 'h8qfHhN1LLAmnYbcCsmi'
                },
                from: "sasha.shumilkin010101@mail.ru"
            });
            const mailOptions = {
                from: 'sasha.shumilkin010101@mail.ru',
                to: `${userEmail}`,
                subject: 'От компании "ИП Габдрахманов И.И."',
                text: "Приветствуем Вас, " + supplierName + " " + supplierPatronymic + ". Мы рады нашему сотрудничеству и надеемся на плодотворную работу вместе с Вами 🧡 Высылаем Вам Ваш пароль: " + password + "."
            };
            await transporter.sendMail(mailOptions)

            const supplier = await Supplier.create({
                supplierImage: fileName,
                supplierSurname,
                supplierName,
                supplierPatronymic,
                userId: user.id
            })

            return res.json({supplier})
        } catch (error) {
            return next(ErrorHandler.internal(`Непредвиденная ошибка: ${error}`))
        }
    }
}

module.exports = new AdminController()