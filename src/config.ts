import { getConfig, getLocationData } from './store'

export default {
  id: 1000,
}

export const locales = {
  sr: {
    desk: 'Salter:',
    room: 'Soba:',
    waiting: 'Broj Stranaka prije vas:',
  },
  en: {
    desk: 'Desk:',
    room: 'Room:',
    waiting: 'Customers before you:',
  },
}

const getDesksForServices = (data?: {
  desks: { number: number; type: number }[]
}) => {
  if (data) {
    const locale = getConfig('locale')
    let countersString = `${locales[locale].desk} `
    let roomsString = `${locales[locale].room} `
    data.desks.forEach((item, i) => {
      if (item.type === 1000) {
        countersString += `${item.number}, `
      } else {
        roomsString += `${item.number}, `
      }
    })
    return {
      counters: countersString.endsWith(', ')
        ? countersString.slice(0, -2)
        : '',
      rooms: roomsString.endsWith(', ') ? roomsString.slice(0, -2) : '',
    }
  }
  return {
    counters: '',
    rooms: '',
  }
}

export const getPrintLocationData = (serviceId: number) => {
  const { name, city, address, mainLocationName, services } = getLocationData()
  const service = services.filter((item) => item.id === serviceId)[0]
  const { counters, rooms } = getDesksForServices(service)
  return {
    counters,
    rooms,
    serviceName: service.name,
    locationName: mainLocationName,
    address: `${city}, ${address}`,
  }
}
