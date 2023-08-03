import fs from 'fs'
import { http } from './http'

export interface Ticket {
  internalId: number
  orderNumber: number
  status: 'pending' | 'assigned' | 'done'
  serviceId: number
  created: number
  assigned: number
  deskId: number
}

export interface Availability {
  deskId: number
  socketId: string
  serviceId: number
  employeeId: number
  deskType: number
  deskNumber: number
}

interface State {
  config: { locale: 'sr' | 'en' }
  credit: number
  openTickets: Ticket[]
  availability: Availability[]
  logs: Ticket[]
  locationData: any
}

export const deviceId = 100

export let state: State = {
  config: {
    locale: 'en',
  },
  credit: 0,
  locationData: {},
  openTickets: [],
  availability: [],
  logs: [],
}

export const getConfig = (key?: string) => {
  if (key) {
    return state.config[key]
  }
  return state.config
}

export const getLocationData = (key?: string) => {
  if (key) {
    return state.locationData[key]
  }
  return state.locationData
}

export const getOpenTickets = (internalId?: number, serviceId?: number) => {
  if (internalId) {
    return state.openTickets.find((item) => +item?.internalId === internalId)
  } else if (serviceId) {
    return state.openTickets.filter(
      (item) => +item.serviceId === serviceId && item.status === 'pending'
    )[0]
  }
  return state.openTickets
}

export const handleOpenTickets = (
  ticket: Ticket,
  action: 'CREATE' | 'UPDATE' | 'REMOVE' = 'UPDATE'
) => {
  let openTickets = [...state.openTickets]
  if (action === 'CREATE') {
    openTickets = [...openTickets, ticket]
  } else if (action === 'UPDATE') {
    openTickets = openTickets.map((item) => {
      if (+item?.internalId === +ticket?.internalId) {
        return ticket
      }
      return item
    })
  } else {
    openTickets = openTickets.filter(
      (item) => +item.internalId !== +ticket.internalId
    )
  }
  state = { ...state, openTickets }
  fs.writeFileSync('openTickets.json', JSON.stringify(openTickets))
}

export const getPendingCount = (serviceId?: number) => {
  if (serviceId) {
    return state.openTickets.filter(
      (item) => +item.serviceId === +serviceId && item.status === 'pending'
    ).length
  } else {
    let countHandler = {}
    state.locationData?.services?.forEach((item) => {
      countHandler = { ...countHandler, [item.id]: 0 }
    })
    console.log('countHandler', countHandler)
    state.openTickets
      .filter((item) => item.status === 'pending')
      .forEach((item) => {
        const key = `${item.serviceId}`
        countHandler = {
          ...countHandler,
          [key]: countHandler[key] + 1,
        }
      })
    return countHandler
  }
}

export const handleAvailability = (data: {
  action?: 'GET' | 'CREATE' | 'UPDATE' | 'REMOVE'
  serviceId?: number
  deskId?: number
  newItem?: Availability
  socketId?: string
}): void | Availability | Availability[] => {
  const { action = 'GET', serviceId, deskId, newItem, socketId } = data
  let handler = [...state.availability]
  if (action === 'GET') {
    if (serviceId) {
      return handler.find((item) => item.serviceId === serviceId)
    } else if (deskId) {
      return handler.find((item) => +item.deskId === +deskId)
    } else if (socketId) {
      return handler.find((item) => item.socketId === socketId)
    }
    return { ...state.availability }
  } else if (action === 'UPDATE') {
    if (socketId) {
      handler = handler.map((item) => {
        if (item.socketId === socketId) {
          return newItem
        }
        return item
      })
    } else if (deskId) {
      handler = handler.map((item) => {
        if (+item.deskId === +deskId) {
          return newItem
        }
        return item
      })
    }
  } else if (action === 'REMOVE') {
    if (socketId) {
      handler = handler.filter((item) => item.socketId !== socketId)
    } else if (deskId) {
      handler = handler.filter((item) => +item.deskId !== +deskId)
    }
  } else if (action === 'CREATE') {
    handler = [...handler, newItem]
  }
  state = { ...state, availability: handler }
  console.log('New Availability: ', state.availability)
}

export const createNewLog = (data: any) => {
  const handler = [...state.logs, data]
  state = { ...state, logs: handler }
  fs.writeFileSync('logs.json', JSON.stringify(handler))
}

export const getState = () => {
  return state
}

export const handleCredit = (data: {
  action?: 'GET' | 'UPDATE' | 'REMOVE'
  newValue?: number
}) => {
  const { action = 'GET', newValue } = data
  if (action === 'GET') {
    return state.credit
  } else if (action === 'UPDATE') {
    const handler = state.credit + newValue
    state = { ...state, credit: handler }
    fs.writeFileSync('credit.txt', JSON.stringify(handler))
    return handler
  }
}

export const initState = async () => {
  try {
    const { config, locationData } = await http.get(`/config/${deviceId}`)

    // console.log('INIT DATA: ', config, locationData)
    let openTickets = await JSON.parse(
      fs.readFileSync(`openTickets.json`, 'utf8')
    )
    let logs = await JSON.parse(fs.readFileSync(`logs.json`, 'utf8'))
    let credit = +fs.readFileSync(`credit.txt`, 'utf8')

    state = { ...state, config, locationData, openTickets, logs, credit }
  } catch (error) {
    console.log('INIT_STATE_ERROR: ', error)
  }
}
