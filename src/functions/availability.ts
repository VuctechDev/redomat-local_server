import { Data } from './tickets'
import { Availability, handleAvailability } from '../store'

export const getAvailability = (serviceId: number): Availability | null => {
  const availability = handleAvailability({ serviceId }) as Availability
  if (availability) {
    handleAvailability({ action: 'REMOVE', deskId: availability.deskId })
  }
  return availability
}

export const createAvailability = (data: Availability): void => {
  const { deskId } = data
  const availability = handleAvailability({ deskId }) as Availability
  if (!availability) {
    handleAvailability({
      action: 'CREATE',
      newItem: data
    })
  }
}

export const removeAvailability = (socketId: string) => {
  handleAvailability({
    action: 'REMOVE',
    socketId,
  })
}
