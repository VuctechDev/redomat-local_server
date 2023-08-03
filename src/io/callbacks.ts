import { Socket } from 'socket.io'
import { emitIO } from '.'
import {
  createAvailability,
  getAvailability,
  removeAvailability,
} from '../functions/availability'
import { createNewSelfServiceTicket } from '../functions/selfService'
import { assingTicket, closeTicket, createTicket } from '../functions/tickets'
import { getNewTicketPrintData, newPrint } from '../printer'
import {
  Availability,
  getOpenTickets,
  getPendingCount,
  getState,
  handleCredit,
  Ticket,
} from '../store'

export const handleConnect = async (socket: Socket) => {
  console.log('Connected')
  const { locationData } = getState()
  const pendingCount = getPendingCount()
  const credit = handleCredit({})
  emitIO({
    socketId: socket.id,
    action: 'INITIAL_DATA',
    payload: { locationData, pendingCount, credit },
  })
}

export const handleNewTicket = async (data: any, socketId: string) => {
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
    emitIO({
      action: 'NEW_ASSIGNMENT',
      payload: created,
    })
  } else {
    created = createTicket(data)
    emitIO({
      action: 'NEW_PENDING_COUNT',
      payload: created,
    })
  }
  const printData = await getNewTicketPrintData(created)
  //   newPrint(printData)
  emitIO({
    socketId,
    action: 'NEW_TICKET',
    payload: created,
  })
}

export const handleAvailability = async (data: any, socketId: string) => {
  console.log('New Availability: ', data)
  const { serviceId, deskId } = data
  const openTickets = getOpenTickets() as Ticket[]
  const checkAssignment = openTickets
    .filter((item) => item.status === 'assigned')
    .find((item) => +item.deskId === +deskId && +item.serviceId === +serviceId)
  if (checkAssignment) {
    return emitIO({
      socketId,
      action: 'NEW_ASSIGNMENT',
      payload: checkAssignment,
    })
  }
  const nextTicket = getOpenTickets(null, +serviceId) as Ticket
  if (nextTicket) {
    const assigned = assingTicket(data, nextTicket)
    emitIO({
      socketId,
      action: 'NEW_ASSIGNMENT',
      payload: assigned,
    })
    emitIO({
      action: 'NEW_PENDING_COUNT',
      payload: assigned,
    })
  } else {
    createAvailability(data)
    emitIO({
      socketId,
      action: 'NEW_ASSIGNMENT',
      payload: {
        ...data,
        internalId: 0,
        orderNumber: 0,
      },
    })
  }
}

export const handleTicketClose = async (data: any, socketId: string) => {
  const { internalId } = data
  await closeTicket(+internalId)
  emitIO({
    socketId,
    action: 'TICKET_CLOSED',
    payload: +internalId,
  })
}

// ---SELF SERVICE---

export const handleNewSelfService = async (
  data: {
    serviceId: number
    price: number
    quantity: number
  },
  socketId: string
) => {
  console.log('New Self Service', data)
  const { price, quantity } = data
  const credit = handleCredit({})
  if (credit < price * quantity) {
    return emitIO({
      socketId,
      action: 'SELF_SERVICE_COMPLETED',
      payload: data,
    })
  }
  const er = Array(data.quantity).fill(0)

  for (const wq of er) {
    const printData = await createNewSelfServiceTicket(data)
    await newPrint(printData)
  }
  const creditUpdate = handleCredit({
    action: 'UPDATE',
    newValue: price * quantity * -1,
  })
  emitIO({
    socketId,
    action: 'CREDIT_UPDATE',
    payload: creditUpdate,
  })
  emitIO({
    socketId,
    action: 'SELF_SERVICE_COMPLETED',
    payload: data,
  })
}

export const handleDisconnect = (socketId: string) => {
  console.log('Disconnected', socketId)
  removeAvailability(socketId)
}
