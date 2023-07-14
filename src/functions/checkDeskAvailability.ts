import fs from 'fs'
import { Data } from './createNewTicket'

export const checkDeskAvailability = async (
  serviceId: number
): Promise<{ deskId: number; deskType: number; deskNumber: number }> => {
  let availableDesk = null
  let desksAvailability = await JSON.parse(
    fs.readFileSync(`desksAvailability.json`, 'utf8')
  )
  for (const key in desksAvailability) {
    let value = desksAvailability[key]
    if (+key === +serviceId) {
      availableDesk = value[0]
      desksAvailability[key] = value.slice(1)
    }
  }

  if (availableDesk) {
    fs.writeFileSync(
      'desksAvailability.json',
      JSON.stringify(desksAvailability)
    )
  }

  return availableDesk
}

export const createDeskAvailability = async (data: Data) => {
  const { serviceId, deskId, deskType, deskNumber } = data
  let desksAvailability = await JSON.parse(
    fs.readFileSync(`desksAvailability.json`, 'utf8')
  )
  let handler = {}
  let iterationCheck = false
  for (const key in desksAvailability) {
    let value = desksAvailability[key]
    if (+key === +serviceId) {
      iterationCheck = true
      if (!value.some((item) => +item.deskId === +deskId)) {
        value = [...value, { deskId, deskType, deskNumber }]
      }
    }
    handler[key] = value
  }
  if (!iterationCheck) {
    handler[serviceId] = [{ deskId, deskType, deskNumber }]
  }
  fs.writeFileSync('desksAvailability.json', JSON.stringify(handler))
}
