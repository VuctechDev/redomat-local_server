export default {
  id: 1000,
}

const services = [
  {
    id: 12321,
    name: 'Izdavanje Licnih Karata',
    desks: [
      {
        id: 22134,
        type: 1000,
        number: 1,
      },
      {
        id: 22137,
        type: 1000,
        number: 2,
      },
      {
        id: 22137,
        type: 1000,
        number: 3,
      },
    ],
  },
  {
    id: 53678,
    name: 'Izdavanje Pasosa',
    desks: [
      {
        id: 22134,
        type: 1001,
        number: 4,
      },
      {
        id: 22139,
        type: 1001,
        number: 5,
      },
    ],
  },
  {
    id: 56754,
    name: 'Registracija Vozila',
    desks: [
      {
        id: 22134,
        type: 1000,
        number: 5,
      },
    ],
  },
  {
    id: 68786,
    name: 'Preuzimanje Licnih Dokumenata',
    desks: [
      {
        id: 22134,
        type: 1000,
        number: 6,
      },
    ],
  },
]

export const data = {
  id: 123456,
  name: 'CIPS',
  location: {
    id: 1000,
    city: 'Banja Luka',
    address: 'Jovana Ducica 7a',
    code: 78000,
  },
  services: services,
  subservice: '',
}

const getDesksForServices = (data?: {
  desks: { number: number; type: number }[]
}) => {
  if (data) {
    let countersString = 'Salter: '
    let roomsString = 'Soba: '
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
  const {
    name,
    location: { city, address },
    services,
  } = data
  const service = services.filter((item) => item.id === serviceId)[0]
  const { counters, rooms } = getDesksForServices(service)
  return {
    counters,
    rooms,
    serviceName: service.name,
    locationName: name,
    address: `${city}, ${address}`,
  }
}
