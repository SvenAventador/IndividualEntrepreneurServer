const Validation = require("../validation/functions");
const ErrorHandler = require("../errors/errorHandler")
const {
    User,
    Cart,
    Supplier, SupplierGood, CompanyCart
} = require("../database/model");
const bcrypt = require("bcrypt");
const generator = require('generate-password');
const uuid = require("uuid");
const {resolve, extname} = require("path");
const nodemailer = require('nodemailer')

class AdminController {
    async getAllSuppliers(req, res, next) {
        try {
            const suppliers = await Supplier.findAll({
                include: [
                    {model: SupplierGood},
                    {model: User}
                ]
            })

            return res.json({suppliers})
        } catch (error) {
            return next(ErrorHandler.internal(`Непредвиденная ошибка: ${error}`))
        }
    }

    async createSupplier(req, res, next) {
        const {
            userEmail,
            userRole = "SUPPLIER",
            supplierSurname,
            supplierName,
            supplierPatronymic = null
        } = req.body
        const {supplierImage} = req.files || {}

        const allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

        try {
            if (!(Validation.isString(userEmail)) || !(Validation.isEmail(userEmail)))
                return next(ErrorHandler.badRequest('Пожалуйста, введите корректную почту поставщика!'))
            if (!(Validation.isString(supplierSurname) || Validation.isEmpty(supplierSurname)))
                return next(ErrorHandler.badRequest('Пожалуйста, введите корректную фамилию поставщика!'))
            if (!(Validation.isString(supplierName) || Validation.isEmpty(supplierName)))
                return next(ErrorHandler.badRequest('Пожалуйста, введите корректное имя поставщика!'))

            if (supplierImage === undefined)
                return next(ErrorHandler.badRequest('Пожалуйста, выберите изображение!'))

            const fileExtension = extname(supplierImage.name).toLowerCase();
            if (!allowedImageExtensions.includes(fileExtension))
                return next(ErrorHandler.badRequest('Пожалуйста, загрузите файл в формате изображения: jpg, jpeg, png или gif!'));

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

            try {
                await transporter.sendMail(mailOptions)
            } catch (error) {
                return next(ErrorHandler.badRequest('К сожалению, мы не можем отправить сообщение на эту почту! Попробуйте другую!'))
            }

            const supplier = await Supplier.create({
                id: user.id,
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

    async deleteOneSupplier(req, res, next) {
        const {id} = req.query
        try {
            const supplier = await Supplier.findOne({where: {id: id}})
            if (!supplier)
                return next(ErrorHandler.conflict(`Поставщика с идентификатором ${id} не найдено!`))

            const good  = await SupplierGood.findAll({where: {supplierId: supplier.id}})

            const user = await User.findOne({where: {id: supplier.id}})
            if (!user)
                return next(ErrorHandler.conflict(`Пользователя с идентификатором ${id} не найдено!`))

            await Promise.all(good.map((item) => item.destroy()))
            await supplier.destroy()
            await user.destroy()

            return res.status(200).json({message: 'Поставщик успешно удален!'})
        } catch (error) {
            return next(ErrorHandler.internal(`Непредвиденная ошибка: ${error}`))
        }
    }

    async deleteAllSuppliers(req, res, next) {
        try {
            const supplier = await Supplier.findAll()
            if (!supplier)
                return next(ErrorHandler.conflict(`Поставщиков не найдено!`))

            const good  = await SupplierGood.findAll()

            const user = await User.findAll({where: {userRole: 'SUPPLIER'}})
            if (!user)
                return next(ErrorHandler.conflict(`Пользователей с ролью 'ПОСТАВЩИК' не найдено!`))

            await Promise.all(good.map((item) => item.destroy()))
            await Promise.all(supplier.map((item) => item.destroy()))
            await Promise.all(user.map((item) => item.destroy()))

            return res.status(200).json({message: 'Поставщики успешно удалены!'})
        } catch (error) {
            return next(ErrorHandler.internal(`Непредвиденная ошибка: ${error}`))
        }
    }

    async createOrder(req, res, next) {
        const {id} = req.query
        try {
            const good = await SupplierGood.findOne({where: {id: id}})
            const cart = await CompanyCart.findOne({where: {supplierGoodId: good.id}})
            if (cart) {

            }
        } catch (error) {
            return next(ErrorHandler.internal(`Непредвиденная ошибка: ${error}`))
        }
    }
}

module.exports = new AdminController()