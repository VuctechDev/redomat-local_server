import { http } from '../http'
import { getSelfServiceReceipt } from '../printer'
import { deviceId, getLocationData } from '../store'

export const createNewSelfServiceTicket = async (data: {
  serviceId: number
  price: number
  quantity: number
}) => {
  const { serviceId, price, quantity } = data
  const locationId = getLocationData('_id')
  try {
    const { sessionCode } = await http.post('/tickets', {
      deviceId,
      serviceId,
      price,
      locationId,
      valid: true,
    })
    console.log('Create New Self Service Ticket Error:')
    return await getSelfServiceReceipt({ serviceId, price, sessionCode })
  } catch (error) {
    console.log('Create New Self Service Ticket Error: ', error)
  }
}
