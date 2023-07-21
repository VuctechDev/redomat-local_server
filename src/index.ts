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
import { assingTicket, createTicket, closeTicket } from './functions/tickets'
import {
  getAvailability,
  createAvailability,
  removeAvailability,
} from './functions/availability'
import { initiatePrinter, newPrint } from './printer'
import {
  Availability,
  Ticket,
  getOpenTickets,
  getPendingCount,
  getState,
  initState,
} from './store'

const handleNewTicket = async (data: any) => {
  console.log('New Ticket', data)
  const { serviceId } = data
  let availability = getAvailability(+serviceId) as Availability
  let created: Ticket
  if (availability) {
    created = createTicket({
      serviceId,
      ...availability,
      status: 'assigned',
    })
    io.sockets.emit('NEW_ASSIGNMENT', created)
  } else {
    created = createTicket(data)
    io.sockets.emit('NEW_PENDING_COUNT', created)
  }
  // newPrint(created)
  io.sockets.emit('NEW_TICKET', created)
}

const handleAvailability = async (data: any) => {
  // console.log('New Availability: ', data)
  const { serviceId, deskId } = data
  const openTickets = getOpenTickets() as Ticket[]
  const checkAssignment = openTickets
    .filter((item) => item.status === 'assigned')
    .find((item) => +item.deskId === +deskId && +item.serviceId === +serviceId)
  if (checkAssignment) {
    return io.sockets.emit('NEW_ASSIGNMENT', checkAssignment)
  }
  const nextTicket = getOpenTickets(null, +serviceId) as Ticket
  if (nextTicket) {
    const updated = assingTicket(data, nextTicket)
    io.sockets.emit('NEW_ASSIGNMENT', updated)
    io.sockets.emit('NEW_PENDING_COUNT', updated)
  } else {
    createAvailability(data)
    io.sockets.emit('NEW_ASSIGNMENT', {
      ...data,
      internalId: 0,
      orderNumber: 0,
    })
  }
}

const handleTicketClose = async (data: any) => {
  const { internalId } = data
  await closeTicket(+internalId)
  io.sockets.emit('TICKET_CLOSED', +internalId)
}

const handleConnect = async (socket: Socket) => {
  console.log('Connected')
  // const serviceId = socket.handshake.query?.serviceId
  const { locationData } = getState()
  const pendingCount = getPendingCount()

  io.to(socket.id).emit('INITIAL_DATA', { locationData, pendingCount })
}

// const handleDeskInitialState = (
//   socket: Socket,
//   data: { serviceId: number; deskId: number }
// ) => {
//   const { serviceId, deskId } = data
//   if (serviceId) {
//     const availability = getAvailability(+serviceId) as Availability
//     if (availability.some((item) => +item.deskId === +deskId)) {
//     }
//   }

//   const openTickets = getOpenTickets() as Ticket[]
//   const checkAssignment = openTickets.find(
//     (item) => item.status === 'assigned' && +item.deskId === +deskId
//   )
// }

const handleDisconnect = (socketId: string) => {
  console.log('Disconnected', socketId)
  removeAvailability(socketId)
}

//  MIDDLEWARES

app.use(bodyParser.json())
app.use(cors())

// VARIABLES

const PORT = process.env.PORT || 8080

// SOCKET.IO

io.use((socket: Socket, next: () => void) => {
  console.log('Connection Midleware')
  next()
}).on('connection', (socket: Socket) => {
  handleConnect(socket)

  socket.on('NEW_TICKET', handleNewTicket)
  // socket.on('NEW_PRINT', handleNewPrint)
  // socket.on('DESK_INITIAL_STATE', () => handleDeskInitialState())
  socket.on('NEW_AVAILABILITY', (data) =>
    handleAvailability({ ...data, socketId: socket.id })
  )
  socket.on('TICKET_CLOSED', handleTicketClose)
  socket.on('disconnect', () => handleDisconnect(socket.id))
})

const init = async () => {
  await checkInitialSetup()
  await initState()
  // console.log(getAvailability(536784))
}

init()

server.listen(PORT, () => console.log(`Server ok! and running on ${PORT}`))
