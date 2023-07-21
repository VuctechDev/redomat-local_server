import { Data } from './tickets'
import { Availability, handleAvailability } from '../store'

export const getAvailability = (serviceId: number): Availability | null => {
  const availability = handleAvailability({ serviceId }) as Availability
  console.log('New Availability2: ', availability)
  if (availability) {
    handleAvailability({ action: 'REMOVE', deskId: availability.deskId })
  }
  return availability
}

export const createAvailability = (data: Data): void => {
  const { serviceId, deskId, socketId } = data
  const availability = handleAvailability({ deskId }) as Availability
  if (!availability) {
    handleAvailability({
      action: 'CREATE',
      newItem: { serviceId, deskId, socketId },
    })
  }
}

export const removeAvailability = (socketId: string) => {
  handleAvailability({
    action: 'REMOVE',
    socketId,
  })
}
