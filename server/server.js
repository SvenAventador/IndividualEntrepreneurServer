require('dotenv').config()
const express = require('express')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const path = require('path')

const database = require('./database/db')
require('./database/model')
const routes = require('./routes/routes')
const errorMiddleware = require('./middlewares/errorHandlerMiddleware')
const PORT = process.env.PORT || 5000

const app = express()
app.use(express.json())
app.use(cors())
app.use(fileUpload({
    limits: {
        fileSize: 50 * 1024 * 1024
    }
}))
app.use(express.static(path.resolve(__dirname, 'static')))
app.use('/api', routes)

app.use(errorMiddleware)
app.get('/', (req, res) => {
    res.json({message: 'Server is working!'})
})

const start = async () => {
    try {
        await database.authenticate()
        await database.sync()

        app.listen(PORT, () => {
            console.log(`Сервер запущен на порту ${PORT}`)
        })
    } catch (error) {
        console.error(`Сервер нашел следующие ошибки при подключении к Базе Данных: ${error}`)
    }
}

start().then(() => {
    console.log(`Сервер запущен без ошибок!`)
}).catch((error) => {
    console.error(`Сервер наашел следующие ошибки во время начала работы сервера: ${error}`)
})