const ErrorHandler = require("../errors/errorHandler");
const {Invoice, CompanyGood} = require("../database/model");
const path = require("path");
const ExcelJS = require('exceljs')

class ManagerController {
    async getAdoptInvoice(req, res, next) {
        try {
            const invoices = await Invoice.findAll({
                where: {
                    isAdopted: true,
                    deliveryOrderStatusId: 6
                }
            })

            return res.json({invoices})
        } catch (error) {
            return next(ErrorHandler.internal(`Непредвиденная ошибка: ${error}`))
        }
    }

    async closeOrder(req, res, next) {
        const {id} = req.query;
        try {
            const invoice = await Invoice.findOne({where: {id: id}});
            const filePath = path.resolve(__dirname, '..', 'static', 'xlsx', invoice.invoiceFile);
            const workbook = new ExcelJS.Workbook();

            await workbook.xlsx.readFile(filePath);

            const worksheet = workbook.getWorksheet(1);
            const rows = [];

            for (let i = 2; i <= worksheet.rowCount - 1; i++) {
                const row = worksheet.getRow(i);
                const rowData = {
                    name: row.getCell(1).value,
                    description: row.getCell(2).value,
                    type: row.getCell(3).value,
                    brand: row.getCell(4).value,
                    price: row.getCell(5).value,
                    amount: row.getCell(6).value,
                    image: row.getCell(7).value
                };

                rows.push(rowData);
                try {
                    let companyGood = await CompanyGood.findOne({where: {goodName: rowData.name}});
                    if (companyGood) {
                        await CompanyGood.update({
                                goodAmount: companyGood.goodAmount + rowData.amount
                            }, {
                                where: {
                                    goodName: rowData.name
                                }
                            }
                        );
                    } else {
                        await CompanyGood.create({
                            goodName: rowData.name,
                            goodDescription: rowData.description,
                            goodType: rowData.type,
                            goodBrand: rowData.brand,
                            goodAmount: rowData.amount,
                            goodPrice: rowData.price,
                            goodImage: rowData.image
                        });
                    }
                } catch (error) {
                    return next(ErrorHandler.badRequest(`Ошибка при создании объекта в таблицу CompanyGood: ${error}`))
                }
            }

            await invoice.destroy()
            return res.json(rows);
        } catch (error) {
            return next(ErrorHandler.internal(`Непредвиденная ошибка: ${error}`));
        }
    }

}

module.exports = new ManagerController()