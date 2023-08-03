import express from 'express'
const app = express()
const server = require('http').createServer(app)
import cors from 'cors'
import bodyParser from 'body-parser'
import { checkInitialSetup } from './functions/initialSetup'
import { initiatePrinter } from './printer'
import { initState } from './store'
import { initCredit } from './functions/credit'
import { initiateIO } from './io'

app.use(bodyParser.json())
app.use(cors())

const init = async () => {
  await checkInitialSetup()
  await initState()
  initiateIO(server)
  initiatePrinter()
  initCredit()
}

init()

const PORT = process.env.PORT || 8080

server.listen(PORT, () => console.log(`Server ok! and running on ${PORT}`))
