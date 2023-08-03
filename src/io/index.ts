import { Socket } from 'socket.io'
import {
  handleAvailability,
  handleConnect,
  handleDisconnect,
  handleNewSelfService,
  handleNewTicket,
  handleTicketClose,
} from './callbacks'

// const io = require('socket.io')

import { Server } from 'socket.io'
let io: Server | null = null

export const initiateIO = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  io.use((socket: Socket, next: () => void) => {
    console.log('Connection Midleware')
    next()
  }).on('connection', (socket: Socket) => {
    // REDOMAT
    handleConnect(socket)
    socket.on('NEW_TICKET', (data) => handleNewTicket(data, socket.id))
    socket.on('NEW_AVAILABILITY', (data) =>
      handleAvailability({ ...data, socketId: socket.id }, socket.id)
    )
    socket.on('TICKET_CLOSED', (data) => handleTicketClose(data, socket.id))
    // ---SELFSERVICE---
    socket.on('NEW_SELF_SERVICE', (data) =>
      handleNewSelfService(data, socket.id)
    )
    socket.on('disconnect', () => handleDisconnect(socket.id))
  })
}

export const subscribe = () => {}

export const emitIO = (data: {
  action: string
  payload: any
  socketId?: string
}) => {
  const { payload, action, socketId } = data
  if (socketId) {
    return io.to(socketId).emit(action, payload)
  }
  io.sockets.emit(action, payload)
}
