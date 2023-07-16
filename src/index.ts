import express from 'express'
const app = express()
const server = require('http').createServer(app)
import fs from 'fs'
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
import cors from 'cors'
import bodyParser from 'body-parser'
import { Socket } from 'socket.io'
import { checkInitialSetup } from './functions/initialSetup'
import {
  assingOpenTicket,
  createNewTicket,
  finishAssignedTicket,
  getNextOpenTicket,
  getRemainingCount,
} from './functions/createNewTicket'
import {
  checkDeskAvailability,
  createDeskAvailability,
} from './functions/checkDeskAvailability'
import { initiatePrinter, newPrint } from './printer'

const handleNewTicket = async (data: any) => {
  console.log('NewRecord', data)
  const { serviceId } = data
  let availableDesk = await checkDeskAvailability(serviceId)
  let created
  if (availableDesk) {
    created = await createNewTicket({
      serviceId,
      ...availableDesk,
      status: 'assigned',
    })
    io.sockets.emit('NEW_ASSIGNMENT', created)
  } else {
    created = await createNewTicket(data)
    io.sockets.emit('NEW_PENDING_COUNT', created)
  }
  newPrint(created)
  io.sockets.emit('NEW_TICKET', created)
}

const handleAvailability = async (data: any) => {
  console.log('NewAvailability ', data)
  const nextTicket = await getNextOpenTicket(data?.serviceId)
  if (nextTicket) {
    const updated = await assingOpenTicket(data, nextTicket)
    io.sockets.emit('NEW_ASSIGNMENT', updated)
    io.sockets.emit('NEW_PENDING_COUNT', updated)
  } else {
    await createDeskAvailability(data)
    io.sockets.emit('NEW_ASSIGNMENT', {
      ...data,
      internalId: 0,
      orderNumber: 0,
    })
  }
}

const handleTicketClose = async (data: any) => {
  const { internalId } = data
  await finishAssignedTicket(internalId)
  console.log('SACUVAJ ZAVRSENI TIKET U BAZU')
  console.log('OBRISI IZ ASAJNOVANIH')
  io.sockets.emit('TICKET_CLOSED', internalId)
}

const handleConnect = async (serviceId: number) => {
  let openTickets = await JSON.parse(
    fs.readFileSync(`openTickets.json`, 'utf8')
  )
  io.sockets.emit('NEW_PENDING_COUNT', {
    serviceId,
    remainingTickets: getRemainingCount(openTickets, serviceId),
  })
}

//  MIDDLEWARES

app.use(bodyParser.json())
app.use(cors())

// VARIABLES

const PORT = process.env.PORT || 8080

// SOCKET.IO

io.use((socket, next: () => void) => {
  console.log('validacija')
  next()
}).on('connection', (socket: Socket) => {
  const serviceId = socket.handshake.query?.serviceId
  if (serviceId) {
    handleConnect(+serviceId)
  }
  console.log('Connected', serviceId)
  socket.on('NEW_TICKET', handleNewTicket)
  // socket.on('NEW_PRINT', handleNewPrint)
  socket.on('NEW_AVAILABILITY', handleAvailability)
  socket.on('TICKET_CLOSED', handleTicketClose)
  socket.on('disconnect', (data) => console.log('opa2', data))
})

checkInitialSetup()
initiatePrinter()

server.listen(PORT, () => console.log(`Server ok! and running on ${PORT}`))
