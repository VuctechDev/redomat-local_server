import fs from 'fs'
import { getOrderNumber } from './orderNumber'
import { getInternalId } from './internalId'
import {
  Ticket,
  createNewLog,
  getLocationData,
  getOpenTickets,
  getPendingCount,
  handleOpenTickets,
} from '../store'
import { getUTC } from './utils'
import { http } from '../api'

export interface Data {
  internalId?: number
  socketId: string
  serviceId: number
  deskId: number
  status?: 'pending' | 'assigned' | 'done'
  employeeId: number
}

const createItem = (data: Data): Ticket => {
  const created = getUTC()
  let orderNumber = getOrderNumber()
  let internalId = getInternalId()
  return {
    internalId,
    orderNumber,
    status: 'pending',
    ...data,
    created,
    updated: created,
  }
}

export const createTicket = (data: Data) => {
  const item = createItem(data)
  handleOpenTickets(item, 'CREATE')
  return {
    ...item,
    remainingTickets: getPendingCount(data.serviceId),
  }
}

export const assingTicket = (data: Data, ticket: Ticket) => {
  const { socketId, ...rest } = data
  const updated = getUTC()
  const handler = { ...ticket, ...rest, status: 'assigned', updated } as Ticket
  handleOpenTickets(handler, 'UPDATE')
  return {
    ...handler,
    remainingTickets: getPendingCount(data.serviceId),
  }
}

export const closeTicket = async (internalId: number) => {
  try {
    const updated = getUTC()
    const locationId = getLocationData('_id')
    const { status, ...rest } = getOpenTickets(internalId) as Ticket
    await http.post('/tickets', { ...rest, updated, locationId })
    handleOpenTickets({ status, ...rest }, 'REMOVE')
    createNewLog({ ...rest, updated, locationId })
  } catch (error) {
    console.log('ERROR', error)
  }
}
