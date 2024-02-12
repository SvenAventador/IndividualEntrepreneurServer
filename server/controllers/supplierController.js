const ErrorHandler = require("../errors/errorHandler");
const Validation = require("../validation/functions");
const {
    SupplierGood,
    User, Invoice
} = require("../database/model");
const uuid = require("uuid");
const {
    resolve,
    extname
} = require("path");

class SupplierController {
    async getAllGoods(req, res, next) {
        const {
            userId
        } = req.query
        try {
            if (userId === null)
                return next(ErrorHandler.badRequest('Пожалуйста, укажите идентификатор поставщика!'))
            await User.findOne({where: {id: userId}}).then((user) => {
                if (!user || user.userRole !== 'SUPPLIER')
                    return next(ErrorHandler.conflict(`Поставщика с идентификатором ${userId} не найдено!`))
            })
            const goods = await SupplierGood.findAll({where: {supplierId: userId}})
            if (!goods) {
                return next(ErrorHandler.conflict(`У поставщика с идентификатором ${userId} все еще отсутствуют товары!`))
            }

            return res.json({goods})
        } catch (error) {
            return next(ErrorHandler.internal(`Непредвиденная ошибка: ${error}`))
        }
    }

    async getOneGood(req, res, next) {
        const {id} = req.query
        try {
            const good = await SupplierGood.findOne({where: {id: id}})
            if (!good)
                return next(ErrorHandler.conflict(`Товара с идентификатором ${id} не найдено!`))

            return res.json({good})
        } catch (error) {
            return next(ErrorHandler.internal(`Непредвиденная ошибка: ${error}`))
        }
    }

    async addGood(req, res, next) {
        const {
            goodName,
            goodDescription,
            goodType,
            goodBrand,
            goodAmount,
            goodPrice
        } = req.body

        const {userId} = req.query

        const {goodImage} = req.files || {}

        const allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

        try {
            if (!(Validation.isString(goodName)))
                return next(ErrorHandler.badRequest('Пожалуйста, введите корректно имя товара!'))
            if (!(Validation.isString(goodDescription)))
                return next(ErrorHandler.badRequest('Пожалуйста, введите корректно описание товара!'))
            if (!(Validation.isString(goodType)))
                return next(ErrorHandler.badRequest('Пожалуйста, введите корректно тип товара!'))
            if (!(Validation.isString(goodBrand)))
                return next(ErrorHandler.badRequest('Пожалуйста, введите корректно бренд товара!'))
            if (!(Validation.isNumber(goodAmount)) && goodAmount < 1)
                return next(ErrorHandler.badRequest('Пожалуйста, введите корректно количество товара! Минимальное количество товаров - 1!'))
            if (!(Validation.isNumber(goodPrice)) && goodPrice < 50)
                return next(ErrorHandler.badRequest('Пожалуйста, введите корректно цену товара! Минимальная цена товаров - 50₽!'))

            if (goodImage === undefined)
                return next(ErrorHandler.badRequest('Пожалуйста, выберите изображение!'))
            const fileExtension = extname(goodImage.name).toLowerCase();
            if (!allowedImageExtensions.includes(fileExtension))
                return next(ErrorHandler.badRequest('Пожалуйста, загрузите файл в формате изображения: jpg, jpeg, png или gif!'));

            await User.findOne({where: {id: userId}}).then((user) => {
                if (!user || user.userRole !== 'SUPPLIER')
                    return next(ErrorHandler.conflict(`Пользователя с идентификатором ${userId} не найдено!`))
            })

            await SupplierGood.findOne({where: {goodName: goodName}}).then((good) => {
                if (good) return next(ErrorHandler.conflict(`Товар с названием ${goodName} уже существует!`))
            })

            let fileName = uuid.v4() + ".jpg"
            await goodImage.mv(resolve(__dirname, '..', 'static', fileName))

            const good = await SupplierGood.create({
                goodName,
                goodDescription,
                goodType,
                goodBrand,
                goodAmount,
                goodPrice,
                goodImage: fileName,
                supplierId: userId
            })

            return res.json({good})
        } catch (error) {
            return next(ErrorHandler.internal(`Непредвиденная ошибка: ${error}`))
        }
    }

    async updateGood(req, res, next) {
        const {
            id,
            goodName,
            goodDescription,
            goodType,
            goodBrand,
            goodAmount,
            goodPrice
        } = req.body

        let goodImageFileName = null;
        if (req.files && req.files.goodImage) {
            const goodImage = req.files.goodImage;
            const allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
            const fileExtension = extname(goodImage.name).toLowerCase();

            if (!allowedImageExtensions.includes(fileExtension))
                return next(ErrorHandler.badRequest('Пожалуйста, загрузите файл в формате изображения: jpg, jpeg, png или gif!'));

            goodImageFileName = uuid.v4() + fileExtension;

            try {
                await goodImage.mv(resolve(__dirname, '..', 'static', goodImageFileName));
            } catch (error) {
                return next(ErrorHandler.internal(`Ошибка при сохранении изображения: ${error}`));
            }
        }

        try {
            if (!(Validation.isString(goodName)))
                return next(ErrorHandler.badRequest('Пожалуйста, введите корректно имя товара!'))
            if (!(Validation.isString(goodDescription)))
                return next(ErrorHandler.badRequest('Пожалуйста, введите корректно описание товара!'))
            if (!(Validation.isString(goodType)))
                return next(ErrorHandler.badRequest('Пожалуйста, введите корректно тип товара!'))
            if (!(Validation.isString(goodBrand)))
                return next(ErrorHandler.badRequest('Пожалуйста, введите корректно бренд товара!'))
            if (!(Validation.isNumber(goodAmount)) && goodAmount < 1)
                return next(ErrorHandler.badRequest('Пожалуйста, введите корректно количество товара! Минимальное количество товаров - 1!'))
            if (!(Validation.isNumber(goodPrice)) && goodPrice < 50)
                return next(ErrorHandler.badRequest('Пожалуйста, введите корректно цену товара! Минимальная цена товаров - 50₽!'))

            const good = await SupplierGood.findOne({where: {id: id}})

            if (!good)
                return next(ErrorHandler.conflict(`Товара с идентификатором ${id} не найдено!`))

            if (good.goodName !== goodName && await SupplierGood.findOne({where: {goodName: goodName}}))
                return next(ErrorHandler.conflict(`Товар с названием ${goodName} уже существует в системе!`))

            const [, updateCandidate] = await SupplierGood.update({
                goodName,
                goodDescription,
                goodType,
                goodBrand,
                goodAmount,
                goodPrice,
                supplierId: good.supplierId,
                goodImage: goodImageFileName ? goodImageFileName : good.goodImage
            }, {
                where: {id: id},
                returning: true
            })

            return res.json({updateCandidate})
        } catch (error) {
            return next(ErrorHandler.internal(`Непредвиденная ошибка: ${error}`))
        }
    }

    async deleteOneGood(req, res, next) {
        const {id} = req.query
        try {
            await SupplierGood.findOne({where: {id: id}}).then(async (good) => {
                if (!good)
                    return next(ErrorHandler.conflict(`Товара с идентификатором ${id} не найдено!`))

                await good.destroy()
                return res.status(200).json({message: `Товар с идентификатором ${id} успешно удален!`})
            })
        } catch (error) {
            return next(ErrorHandler.internal(`Непредвиденная ошибка: ${error}`))
        }
    }

    async deleteAllGoods(req, res, next) {
        const {userId} = req.query

        try {
            await User.findOne({where: {id: userId}}).then((user) => {
                if (!user || user.userRole !== 'SUPPLIER')
                    return next(ErrorHandler.conflict('Пожалуйста, укажите корректного поставщика'))
            })

            await SupplierGood.findAll({where: {supplierId: userId}}).then((good) => {
                if (!good.length)
                    return next(ErrorHandler.conflict(`Товаров у поставщика с идентификатором ${userId} не найдено!`))

                good.map((item) => {
                    item.destroy()
                })

                return res.status(200).json({message: `Товары у поставщика с идентификатором ${userId} успешно удалены!`})
            })
        } catch (error) {
            return next(ErrorHandler.internal(`Непредвиденная ошибка: ${error}`))
        }
    }

    async getAllInvoice(req, res, next) {
        const {
            supplierId,
        } = req.query
        try {
            const allInvoice = await Invoice.findAll({
                where: {
                    supplierId: supplierId
                },
                order:
                    [['id', 'asc']]
            })
            return res.json({allInvoice})
        } catch (error) {
            return next(ErrorHandler.internal(`Непредвиденная ошибка: ${error}`))
        }
    }

    async adoptInvoice(req, res, next) {
        const {id} = req.query

        try {
            const candidate = await Invoice.findOne({where: {id: id}})
            await candidate.update({isAdopted: true})
            return res.status(200).json({message: 'Накладная успешно принята!'})
        } catch (error) {
            return next(ErrorHandler.internal(`Непредвиденная ошибка: ${error}`))
        }
    }

    async changeDeliveryStatus(req, res, next) {
        const {
            invoiceId,
            deliveryStatusId
        } = req.query

        try {
            const candidate = await Invoice.findOne({where: {id: invoiceId}})
            await candidate.update({
                deliveryOrderStatusId: deliveryStatusId
            })

            return res.status(200).json({message: 'Статус доставки успешно обновлен!'})
        } catch (error) {
            return next(ErrorHandler.internal(`Непредвиденная ошибка: ${error}`))
        }
    }
}

module.exports = new SupplierController()