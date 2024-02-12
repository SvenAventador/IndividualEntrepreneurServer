const sequelize = require('./db')
const { DataTypes } = require('sequelize')

const User = sequelize.define('user', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userEmail: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    userPassword: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userRole: {
        type: DataTypes.STRING,
        defaultValue: 'USER'
    },
    userSurname: {
        type: DataTypes.STRING,
        allowNull: true
    },
    userName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    userPatronymic: {
        type: DataTypes.STRING,
        allowNull: true
    },
    userAddress: {
        type: DataTypes.STRING,
        allowNull: true
    },
    userPhone: {
        type: DataTypes.STRING,
        allowNull: true
    }
})

const Invoice = sequelize.define('invoice', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    invoiceFile: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    isAdopted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
})

const CompanyCart = sequelize.define('company_cart', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    countGood: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
})

const Supplier = sequelize.define('supplier', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    supplierImage: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    supplierSurname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    supplierName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    supplierPatronymic: {
        type: DataTypes.STRING,
        allowNull: true
    }
})

const SupplierGood = sequelize.define('supplier_good', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    goodName: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    goodDescription: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    goodType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    goodBrand: {
       type: DataTypes.STRING,
       allowNull: false
    },
    goodAmount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    goodPrice: {
        type: DataTypes.DOUBLE,
        defaultValue: 0.00
    },
    goodImage: {
        type: DataTypes.TEXT,
        allowNull: false
    }
})

const CompanyGood = sequelize.define('company_good', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    goodName: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    goodDescription: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    goodType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    goodBrand: {
        type: DataTypes.STRING,
        allowNull: false
    },
    goodAmount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    goodPrice: {
        type: DataTypes.DOUBLE,
        defaultValue: 0.00
    },
    goodImage: {
        type: DataTypes.TEXT,
        allowNull: false
    }
})

const DeliveryOrderStatus = sequelize.define('delivery_order_status',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    typeName: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    }
})

User.hasOne(Supplier)
Supplier.belongsTo(User)

Supplier.hasMany(Invoice)
Invoice.belongsTo(Supplier)

Supplier.hasMany(SupplierGood)
SupplierGood.belongsTo(Supplier)

Supplier.hasMany(CompanyCart)
CompanyCart.belongsTo(Supplier)

SupplierGood.hasMany(CompanyCart)
CompanyCart.belongsTo(SupplierGood)

DeliveryOrderStatus.hasMany(Invoice)
Invoice.belongsTo(DeliveryOrderStatus)

module.exports = {
    User,
    Invoice,
    CompanyCart,
    Supplier,
    SupplierGood,
    CompanyGood
}