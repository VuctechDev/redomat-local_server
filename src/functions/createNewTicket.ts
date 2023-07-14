import fs from 'fs'
import { getOrderNumber } from './orderNumber'
import { getInternalId } from './internalId'

export interface Data {
  internalId?: number
  serviceId: number
  deskId: number
  deskType: number
  deskNumber: number
  status?: 'pending' | 'assigned' | 'done'
}

const createItem = (data: Data) => {
  const created =
    new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000
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

export const getRemainingCount = (data: Data[], serviceId: number) => {
  return data.filter(
    (item) => +item.serviceId === +serviceId && item.status === 'pending'
  ).length
}

export const createNewTicket = async (data: Data) => {
  const item = createItem(data)
  let openTickets = await JSON.parse(
    fs.readFileSync(`openTickets.json`, 'utf8')
  )
  openTickets = [...openTickets, { ...item }]
  fs.writeFileSync('openTickets.json', JSON.stringify(openTickets))
  return {
    ...item,
    remainingTickets: getRemainingCount(openTickets, data.serviceId),
  }
}

export const assingOpenTicket = async (data: Data, ticket: Data) => {
  const updated =
    new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000

  let openTickets = await JSON.parse(
    fs.readFileSync(`openTickets.json`, 'utf8')
  )
  const handler = { ...ticket, ...data, status: 'assigned', updated }
  openTickets = openTickets.map((item) => {
    if (+item?.internalId === +ticket?.internalId) {
      return handler
    }
    return item
  })
  fs.writeFileSync('openTickets.json', JSON.stringify(openTickets))
  return {
    ...handler,
    remainingTickets: getRemainingCount(openTickets, data.serviceId),
  }
}

export const finishAssignedTicket = async (internalId: number) => {
  const updated =
    new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000
  let openTickets = await JSON.parse(
    fs.readFileSync(`openTickets.json`, 'utf8')
  )
  let logs = await JSON.parse(fs.readFileSync(`logs.json`, 'utf8'))
  const ticketToBeClosed = openTickets.find(
    (item: Data) => +item?.internalId === +internalId
  )

  openTickets = openTickets.filter(
    (item: Data) => +item.internalId !== +internalId
  )
  logs = [...logs, { ...ticketToBeClosed, status: 'done', updated }]

  fs.writeFileSync('openTickets.json', JSON.stringify(openTickets))
  fs.writeFileSync('logs.json', JSON.stringify(logs))
  return {
    //   ...updated,
    //   remainingTickets: getRemainingCount(openTickets, data.serviceId),
  }
}

export const getNextOpenTicket = async (serviceId: number): Promise<Data> => {
  let openTickets = await JSON.parse(
    fs.readFileSync(`openTickets.json`, 'utf8')
  )
  return openTickets
    .filter(
      (item) => +item.serviceId === serviceId && item.status === 'pending'
    )
    .sort((a, b) => a.serviceId - b.serviceId)[0]
}
