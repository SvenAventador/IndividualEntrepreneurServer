const Validation = require("../validation/functions");
const ErrorHandler = require("../errors/errorHandler")
const {
    User,
    Cart,
    Supplier,
    SupplierGood,
    CompanyCart,
    Invoice,
    CompanyGood
} = require("../database/model");
const bcrypt = require("bcrypt");
const generator = require('generate-password');
const uuid = require("uuid");
const {
    resolve,
    extname
} = require("path");
const nodemailer = require('nodemailer')
const ExcelJS = require('exceljs')
const {Sequelize} = require("sequelize");

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

            const good = await SupplierGood.findAll({where: {supplierId: supplier.id}})

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

            const good = await SupplierGood.findAll()

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

    async addToCart(req, res, next) {
        const {
            supplierId,
            adminId,
            supplierGoodId
        } = req.query

        try {
            await User.findOne({where: {id: supplierId}}).then((supplier) => {
                if (!supplier.userRole || supplier.userRole !== 'SUPPLIER')
                    return next(ErrorHandler.conflict('Введите номер корректного поставщика'))
            })
            await User.findOne({where: {id: adminId}}).then((admin) => {
                if (!admin || admin.userRole !== 'ADMIN')
                    return next(ErrorHandler.conflict('Введите номер корректного администратора'))
            })

            const good = await SupplierGood.findOne({where: {id: supplierGoodId}})
            if (!good)
                return next(ErrorHandler.badRequest(`Подобного товара у поставщика с номером ${supplierId} не найдено!`))

            const candidate = await CompanyCart.findOne({where: {supplierGoodId: supplierGoodId}})
            if (candidate) {
                if (good.goodAmount < candidate.countGood + 1)
                    return next(ErrorHandler.conflict('Данного товара больше нет на складе!'))

                await candidate.update({
                    countGood: candidate.countGood + 1
                })
                return res.status(200).json({message: `Товар успешно добавлен в корзину!`})
            }

            await CompanyCart.create({
                supplierId,
                userId: adminId,
                supplierGoodId
            })

            return res.status(200).json({message: 'Товар успешно добавлен в корзину!'})
        } catch (error) {
            return next(ErrorHandler.internal(`Непредвиденная ошибка: ${error}`))
        }
    }

    async getGoodsInCart(req, res, next) {
        try {
            let goods_array = []
            const allSupplierIds = await CompanyCart.findAll({
                attributes: [[
                    Sequelize.fn('DISTINCT', Sequelize.col('supplierId')), 'supplierId']],
                raw: true
            });

            for (const {supplierId} of allSupplierIds) {
                const supplierData = await CompanyCart.findAll({
                    where: {supplierId},
                    include: [{
                        model: SupplierGood,
                        attributes: [
                            'goodName',
                            'goodDescription',
                            'goodType',
                            'goodBrand',
                            'goodPrice'
                        ]
                    }
                    ],
                    raw: true
                });

                goods_array = goods_array.concat(supplierData)
            }

            return res.json({goods_array})
        } catch (error) {
            return next(ErrorHandler.internal(`Непредвиденная ошибка: ${error}`))
        }
    }

    async createOrder(req, res, next) {
        const {adminId} = req.query
        try {
            const allSupplierIds = await CompanyCart.findAll({
                attributes: [[
                    Sequelize.fn('DISTINCT', Sequelize.col('supplierId')), 'supplierId']],
                raw: true
            });

            for (const {supplierId} of allSupplierIds) {
                const supplierData = await CompanyCart.findAll({
                    where: {supplierId},
                    include: [{
                        model: SupplierGood,
                        attributes: [
                            'id',
                            'goodName',
                            'goodDescription',
                            'goodType',
                            'goodBrand',
                            'goodAmount',
                            'goodPrice',
                            'goodImage'
                        ]
                    }
                    ],
                    raw: true
                });

                let totalPrice = 0
                for (const data of supplierData) {
                    totalPrice += parseFloat(data['supplier_good.goodPrice']) * data.countGood;
                    const updatedQuantity = data['supplier_good.goodAmount'] - data.countGood;
                    await SupplierGood.update(
                        {
                            goodAmount: updatedQuantity
                        },
                        {
                            where: {
                                id: data['supplier_good.id']
                            }
                        });
                }

                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('SupplierData');

                const headerStyle = {
                    font: {
                        name: 'Times New Roman',
                        size: 16,
                        bold: true
                    },
                    alignment: {
                        vertical: 'middle',
                        horizontal: 'center'
                    },
                    border: {
                        top: {style: 'medium'},
                        bottom: {style: 'medium'},
                        left: {style: 'medium'},
                        right: {style: 'medium'}
                    }
                }

                const dataStyle = {
                    font: {name: 'Arial', size: 14},
                    alignment: {vertical: 'middle', horizontal: 'center'},
                    border: {
                        top: {style: 'medium'},
                        bottom: {style: 'medium'},
                        left: {style: 'medium'},
                        right: {style: 'medium'}
                    }
                }

                worksheet.addRow([
                    'Название товара',
                    'Описание товара',
                    'Тип товара',
                    'Бренд товара',
                    'Цена товара',
                    'Количество товара',
                    'Название файла с изображением товара'
                ]).eachCell((cell) => {
                    cell.style = headerStyle
                })

                const columnWidths = [
                    'Название товара'.length * 2,
                    'Описание товара'.length * 2,
                    'Тип товара'.length * 2,
                    'Бренд товара'.length * 2,
                    'Цена товара'.length * 2,
                    'Количество товара'.length * 2,
                    'Название файла с изображением'.length * 2
                ];

                worksheet.columns.forEach((column, index) => {
                    column.width = columnWidths[index];
                });

                supplierData.forEach((data, index) => {
                    worksheet.addRow([
                        data['supplier_good.goodName'],
                        data['supplier_good.goodDescription'],
                        data['supplier_good.goodType'],
                        data['supplier_good.goodBrand'],
                        data['supplier_good.goodPrice'],
                        data.countGood,
                        data['supplier_good.goodImage']
                    ]).eachCell((cell) => {
                        cell.style = dataStyle;
                    });
                })

                worksheet.addRow([
                    'Общая цена:', `${totalPrice}`
                ]).eachCell((cell) => {
                    cell.style = dataStyle
                })

                let fileName = uuid.v4() + ".xlsx"
                let filePath = resolve(__dirname, '..', 'static', 'xlsx', fileName);
                await workbook.xlsx.writeFile(filePath);

                await Invoice.create({
                    invoiceFile: fileName,
                    supplierId,
                    deliveryOrderStatusId: 1
                })
            }

            await CompanyCart.findAll().then((data) => {
                data.map(async (item) => {
                    await item.destroy()
                })
            })

            return res.status(200).json({message: 'Накладная(-ые) успешно сформированы!'})
        } catch (error) {
            return next(ErrorHandler.internal(`Непредвиденная ошибка: ${error}`))
        }
    }

    async getAllGoods(req, res, next) {
        try {
            const allGoods = await CompanyGood.findAll()
            return res.json({allGoods})
        } catch (error) {
            return next(ErrorHandler.internal(`Непредвиденная ошибка: ${error}`))
        }
    }
}

module.exports = new AdminController()