import { Gpio } from 'onoff'
import { emitIO } from '../io'
import { handleCredit } from '../store'

const sensor = new Gpio(4, 'in')

export const initCredit = () => {
  setInterval(() => {
    const value = sensor.readSync()
    if (value === 1) {
      const creditUpdate = handleCredit({
        action: 'UPDATE',
        newValue: 1,
      })
    console.log("Credit Update: ", creditUpdate)
    emitIO({
        action: 'CREDIT_UPDATE',
        payload: creditUpdate,
      })
    }

  }, 1000)
}
