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

const Cart = sequelize.define('cart', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
})

const CartGood = sequelize.define('cart_good', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
})

const OrderGood = sequelize.define('order_good', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
})

const Order = sequelize.define('order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    dateOrder: {
        type: DataTypes.DATEONLY,
        defaultValue: Date.now()
    }
})

const DeliveryStatus = sequelize.define('delivery_status', {
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

const PaymentStatus = sequelize.define('payment_status', {
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
        defaultValue: 0
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

User.hasOne(Cart)
Cart.belongsTo(User)

User.hasOne(Supplier)
Supplier.belongsTo(User)

Order.hasMany(OrderGood)
OrderGood.belongsTo(Order)

CompanyGood.hasMany(OrderGood)
OrderGood.belongsTo(CompanyGood)

User.hasMany(Order)
Order.belongsTo(User)

DeliveryStatus.hasMany(Order)
Order.belongsTo(DeliveryStatus)

PaymentStatus.hasMany(Order)
Order.belongsTo(PaymentStatus)

Cart.hasMany(CartGood)
CartGood.belongsTo(Cart)

CompanyGood.hasMany(CartGood)
CartGood.belongsTo(CompanyGood)

User.hasMany(Invoice)
Invoice.belongsTo(User)

Supplier.hasMany(Invoice)
Invoice.belongsTo(Supplier)

Supplier.hasMany(SupplierGood)
SupplierGood.belongsTo(Supplier)

Supplier.hasMany(CompanyCart)
CompanyCart.belongsTo(Supplier)

User.hasMany(CompanyCart)
CompanyCart.belongsTo(User)

SupplierGood.hasMany(CompanyCart)
CompanyCart.belongsTo(SupplierGood)

module.exports = {
    User,
    Cart,
    CartGood,
    OrderGood,
    Order,
    DeliveryStatus,
    PaymentStatus,
    Invoice,
    CompanyCart,
    Supplier,
    SupplierGood,
    CompanyGood
}